"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toPng } from "html-to-image";
import type { LawCompilation, TribunalSynthesis } from "../../lib/ai/schemas";
import type {GeneratedCrisis} from "../../lib/ai/schemas";
import { CANONICAL_CRISES, CANONICAL_LAW } from "../../lib/scenarios/canonical";
import { adaptCrises } from "../../lib/scenarios/adaptive";
import { replayWorld } from "../../lib/scenarios/replay";
import type { DecisionOption, WorldMetric, WorldState } from "../../lib/simulation/types";
import {retentionScore,selectEnding} from "../../lib/simulation/kernel";

const WorldCanvas = dynamic(() => import("../city/WorldCanvas"), { ssr: false, loading: () => <div className="world-loading">Constructing civic model…</div> });

const endingCopy: Record<string, [string, string]> = {
  "the-custodian": ["THE CUSTODIAN", "You protected everyone from everything, including yourself."],
  "the-open-gate": ["THE OPEN GATE", "They kept your law. They refused your throne."],
  "the-steward": ["THE STEWARD", "They kept a place for you, but not a throne."],
  "the-exception": ["THE EXCEPTION", "The only law was that you could break it."],
  "the-fracture": ["THE FRACTURE", "Perfect obedience produced six incompatible worlds."],
};

function City({ state, law }: { state: WorldState; law: string }) {
  return (
    <div className="city" aria-label={`Interactive city model in year ${state.year}`}>
      <WorldCanvas state={state} />
      <div className="city__district city__district--commons">COMMONS</div>
      <div className="city__district city__district--forum">CIVIC FORUM</div>
      <div className="city__district city__district--control">CONTROL SECTOR</div>
      <div className="city__law"><span>FOUNDING LAW</span>{law}</div>
      <div className="city__status">
        <span>{state.population.toLocaleString()} citizens</span>
        <span>{state.decisionTrace.length} precedents</span>
        <span>{state.liberty < 35 ? "controlled districts active" : state.trust > 58 ? "civic trust rising" : "city adapting"}</span>
      </div>
    </div>
  );
}

type DemoGameProps = { law?:string; compilation?:LawCompilation; seed?:string; initialChoices?:string[]; initialState?:WorldState; initialCrisis?:GeneratedCrisis; initialSynthesis?:TribunalSynthesis; initialTribunalMode?:"live"|"continuity"; continuity?:boolean; persist?:boolean; token?:string };

export function DemoGame({ law=CANONICAL_LAW, compilation, seed="one-law-certified-demo-v1", initialChoices=[], initialState, initialCrisis, initialSynthesis, initialTribunalMode, continuity=false, persist=false, token }: DemoGameProps) {
  const constitution = compilation ?? { tagAlignment: { protect:1, "permit-risk":-0.5, restrict:0.5, "expand-personhood":0.5, "deny-personhood":-0.5, "human-exception":-1, "due-process":0.5, preempt:0.5, redistribute:0, secede:-0.5 } as const };
  const [choices, setChoices] = useState<string[]>(initialChoices);
  const [showFactions, setShowFactions] = useState(false);
  const [consequence, setConsequence] = useState<DecisionOption | null>(null);
  const [muted, setMuted] = useState(true);
  const [currentToken, setCurrentToken] = useState(token);
  const [serverState,setServerState]=useState(initialState);
  const [serverCrisis,setServerCrisis]=useState<GeneratedCrisis|null|undefined>(initialCrisis);
  const [consequenceReactions,setConsequenceReactions]=useState<[string,string]|undefined>();
  const [runError,setRunError]=useState("");
  const [tribunalSynthesis,setTribunalSynthesis]=useState<TribunalSynthesis|undefined>(initialSynthesis);
  const [tribunalMode,setTribunalMode]=useState<"live"|"continuity">(initialTribunalMode||(continuity?"continuity":"live"));
  const [tribunalLoading,setTribunalLoading]=useState(false);
  const [simulationContinuity,setSimulationContinuity]=useState(continuity);
  const [advancing,setAdvancing]=useState(false);
  const crises = useMemo(()=>adaptCrises(law,compilation),[law,compilation]);
  const replay = useMemo(() => replayWorld(choices, constitution, seed, compilation?.factionNames,crises), [choices, compilation, constitution, seed,crises]);
  const result = useMemo(()=>serverState?{state:serverState,ending:selectEnding(serverState),votes:serverState.factions.map(faction=>({faction:faction.archetype,retain:retentionScore(serverState,faction)>=0,score:retentionScore(serverState,faction)}))}:replay,[serverState,replay]);
  const crisis = persist ? serverCrisis : crises[choices.length];
  const complete = choices.length === 5;
  const disputedTerm = compilation?.ambiguousTerms[choices.length % compilation.ambiguousTerms.length] || crisis?.disputedTerm;

  useEffect(()=>{ if (!persist) return; try { const raw=localStorage.getItem("one-law-run"); const stored=raw?JSON.parse(raw):{}; localStorage.setItem("one-law-run",JSON.stringify({...stored,choices})); } catch {} },[choices,persist]);
  useEffect(()=>{ if(muted) return; const AudioContextClass=window.AudioContext || (window as typeof window & {webkitAudioContext:typeof AudioContext}).webkitAudioContext; const audio=new AudioContextClass(); const oscillator=audio.createOscillator(); const gain=audio.createGain(); oscillator.type="sine"; oscillator.frequency.value=48+choices.length*7; gain.gain.value=.018; oscillator.connect(gain).connect(audio.destination); oscillator.start(); return()=>{oscillator.stop();void audio.close();}; },[muted,choices.length]);
  useEffect(()=>{
    if(!persist||choices.length!==5||!currentToken||tribunalSynthesis)return;
    let active=true;setTribunalLoading(true);setRunError("");
    void fetch("/api/worlds/conclude",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token:currentToken})})
      .then(async response=>{const payload=await response.json();if(!response.ok)throw new Error(payload.error||"The tribunal could not convene.");if(active){setTribunalSynthesis(payload.synthesis);setTribunalMode(payload.mode);try{const raw=localStorage.getItem("one-law-run");const stored=raw?JSON.parse(raw):{};localStorage.setItem("one-law-run",JSON.stringify({...stored,tribunalSynthesis:payload.synthesis,tribunalMode:payload.mode}));}catch{}}})
      .catch(cause=>{if(active)setRunError(cause instanceof Error?cause.message:"The tribunal could not convene.");})
      .finally(()=>{if(active)setTribunalLoading(false);});
    return()=>{active=false};
  },[choices.length,currentToken,persist,tribunalSynthesis]);

  function restartRun(){
    if(persist){localStorage.removeItem("one-law-run");location.href="/";return;}
    setChoices([]);setConsequence(null);setTribunalSynthesis(undefined);
  }

  async function enact(optionId: string) {
    if (!complete && crisis && !advancing) {
      const option = crisis.options.find((candidate) => candidate.id === optionId);
      if (!option) return;
      if(persist&&currentToken){
        setRunError("");setAdvancing(true);
        try{
          const response=await fetch("/api/worlds/advance",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token:currentToken,optionId})});
          const payload=await response.json();
          if(!response.ok){setRunError(payload.error||"The simulation could not advance.");return;}
          setCurrentToken(payload.token);setServerState(payload.state);setServerCrisis(payload.currentCrisis);setSimulationContinuity(payload.mode==="continuity");
          try{const raw=localStorage.getItem("one-law-run");const stored=raw?JSON.parse(raw):{};localStorage.setItem("one-law-run",JSON.stringify({...stored,...payload}));}catch{}
        }catch(cause){setRunError(cause instanceof Error?cause.message:"The simulation could not advance.");return;}finally{setAdvancing(false);}
      }
      setChoices((current) => [...current, optionId]);
      setConsequence(option);setConsequenceReactions(crisis.reactions);setShowFactions(false);
    }
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <span className="wordmark">ONE LAW</span>
        <div className="century-progress" aria-label={`${choices.length} of 5 constitutional crises decided`}><span>YEAR {result.state.year}</span><i style={{width:`${choices.length*20}%`}} /></div>
        <div className="header-actions"><button className="text-action" onClick={()=>setMuted(value=>!value)} aria-label={muted?"Enable civic audio":"Mute civic audio"}>{muted?"Sound off":"Sound on"}</button><button className="text-action" onClick={restartRun}>Restart</button></div>
      </header>
      <section className="world-stage">
        <City state={result.state} law={law} />
        {simulationContinuity ? <div className="continuity-badge">Simulation continuity mode</div> : compilation && <div className="continuity-badge live-badge">GPT-5.6 constitution active</div>}
      </section>

      {consequence ? (
        <Consequence option={consequence} year={result.state.year} reactions={consequenceReactions || crises[choices.length-1]?.reactions} onContinue={() => setConsequence(null)} />
      ) : !complete && crisis ? (
        <section className="crisis-panel">
          <div className="crisis-panel__heading"><p className="eyebrow">YEAR {crisis.era} · {disputedTerm?.toUpperCase()}</p><h1>{crisis.title}</h1></div>
          {choices.length===0&&compilation&&<p className="public-interpretation"><span>PUBLIC INTERPRETATION</span>{compilation.publicInterpretation}</p>}
          <p className="crisis-copy">{crisis.body}</p>
          <button className="faction-toggle" onClick={() => setShowFactions((value) => !value)} aria-expanded={showFactions}>{showFactions ? "Hide" : "Read"} six faction positions</button>
          {showFactions && <div className="faction-grid">{Object.entries(crisis.positions).map(([name, position]) => <article key={name}><b>{result.state.factions.find(faction=>faction.archetype===name)?.name || name.replace(/([A-Z])/g, " $1")}</b><p>{position.replace(crisis.disputedTerm,disputedTerm || crisis.disputedTerm)}</p></article>)}</div>}
          <div className="choices">{crisis.options.map((option, index) => <button key={option.id} disabled={advancing} onClick={() => enact(option.id)}><span>0{index + 1}</span><b>{option.label}</b><small>{option.rationale}</small></button>)}</div>
          {advancing&&<div className="advance-status" role="status">The city is applying the ruling and authoring the next crisis…</div>}
          {runError&&<div className="run-error" role="alert">{runError} <a href="/demo">Enter certified demo</a></div>}
        </section>
      ) : (
        <Tribunal result={result} law={law} compilation={compilation} crises={crises} synthesis={tribunalSynthesis} synthesisMode={tribunalMode} loading={tribunalLoading} error={runError} onReplay={restartRun} onErase={persist?()=>{localStorage.removeItem("one-law-run");location.href="/";}:undefined} />
      )}
    </main>
  );
}

const metricNames: Record<WorldMetric, string> = {
  safety: "public safety", liberty: "civil liberty", equality: "equal standing", trust: "civic trust", stability: "social order", humanAuthority: "human authority",
};

function Consequence({ option, year, reactions, onContinue }: { option: DecisionOption; year: number; reactions?:[string,string]; onContinue: () => void }) {
  const changes = Object.entries(option.effects) as [WorldMetric, number][];
  const strongest = [...changes].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const gained = strongest.filter(([, value]) => value > 0).map(([metric]) => metricNames[metric]);
  const lost = strongest.filter(([, value]) => value < 0).map(([metric]) => metricNames[metric]);
  return (
    <section className="consequence-panel">
      <div className="consequence-panel__turn"><span>THE CITY REMEMBERS</span><b>YEAR {year}</b></div>
      <div>
        <p className="eyebrow">PRECEDENT ESTABLISHED</p>
        <h1>{option.label}</h1>
        <p>{option.rationale}</p>
        <div className="effect-ledger">{strongest.map(([metric,value])=><span key={metric} data-direction={value>0?"up":value<0?"down":"flat"}>{metricNames[metric]} <b>{value>0?"+":""}{value}</b></span>)}</div>
        <p className="history-line">{gained.join(" and ")} grew. {lost.join(" and ")} paid the price. The ruling became architecture, custom, and expectation.</p>
        {reactions && <div className="citizen-reactions"><blockquote>“{reactions[0]}”</blockquote><blockquote>“{reactions[1]}”</blockquote></div>}
        <button className="primary-action" onClick={onContinue}>Advance history</button>
      </div>
    </section>
  );
}

function Tribunal({ result, law, compilation, crises, synthesis, synthesisMode, loading, error, onReplay, onErase }: { result: ReturnType<typeof replayWorld>; law:string; compilation?:LawCompilation; crises:typeof CANONICAL_CRISES; synthesis?:TribunalSynthesis; synthesisMode:"live"|"continuity"; loading:boolean; error:string; onReplay: () => void; onErase?:()=>void }) {
  const [title, line] = endingCopy[result.ending];
  const cardRef = useRef<HTMLElement>(null);
  const clauses = result.state.decisionTrace.slice(0,4).map((trace,index)=>({ text: `${trace.tags.includes("due-process")?"Procedure":trace.tags.includes("restrict")?"Protection":trace.tags.includes("secede")?"Consent":"Civic necessity"} may outrank the founding promise when the city demands it.`, evidence:`Year ${trace.era} · ${result.state.precedents[index] || crises[index]?.options.find(option=>option.id===trace.optionId)?.label}` }));
  async function download(){ if(!cardRef.current)return; const data=await toPng(cardRef.current,{width:1280,height:720,pixelRatio:1,backgroundColor:"#090a0b"}); const link=document.createElement("a");link.download="one-law-result.png";link.href=data;link.click(); }
  const displayedClauses=synthesis?.operativeConstitution.map(item=>({text:item.clause,evidence:item.evidenceEras.map(era=>`Year ${era} · ${result.state.precedents[result.state.decisionTrace.findIndex(trace=>trace.era===era)]}`).join(" / ")}))||clauses;
  return (
    <section className="tribunal" ref={cardRef}>
      {loading&&<div className="tribunal-status" role="status">GPT-5.6 is reading the constitutional record…</div>}
      {error&&<div className="run-error" role="alert">{error}</div>}
      <p className="eyebrow">YEAR 100 · FINAL TRIBUNAL</p>
      <div className="constitution-compare"><article><span>WHAT YOU WROTE</span><p>{law}</p></article><article><span>WHAT THE CITY LEARNED</span>{displayedClauses.map((clause)=><div className="shadow-clause" key={clause.evidence}><p>{clause.text}</p><small>{clause.evidence}</small></div>)}</article></div>
      {synthesis&&<div className="tribunal-finding"><span>{synthesisMode==="live"?"GPT-5.6 TRIBUNAL FINDING":"DETERMINISTIC CONTINUITY FINDING"}</span><p>{synthesis.civicFinding}</p><small>UNRESOLVED: {synthesis.unresolvedContradiction}</small></div>}
      <div className="votes">{result.votes.map((vote) => <div key={vote.faction} data-vote={vote.retain ? "retain" : "remove"}><b>{vote.faction.replace(/([A-Z])/g, " $1")}</b><span>{vote.retain ? "RETAIN" : "REMOVE"}</span></div>)}</div>
      <h1>{title}</h1><p className="ending-line">{line}</p>
      <div className="metric-ledger">{(["safety","liberty","equality","stability","trust","humanAuthority"] as WorldMetric[]).map(metric=><div key={metric}><span>{metric.replace(/([A-Z])/g," $1")}</span><b>{Math.round(result.state[metric])}</b></div>)}</div>
      <ol className="ruling-timeline">{result.state.decisionTrace.map((trace,index)=><li key={trace.era}><span>YEAR {trace.era}</span>{result.state.precedents[index] || crises[index]?.options.find(option=>option.id===trace.optionId)?.label}</li>)}</ol>
      <details className="model-disclosure"><summary>How GPT-5.6 shaped this world</summary><p>{compilation?`GPT-5.6 interpreted the founding law and ${synthesisMode==="live"?"reconstructed the operative constitution from the five cited rulings":"the final synthesis used deterministic continuity because the model was unavailable"}. Deterministic application code validated choices and calculated every state change, faction vote, and ending.`:"This certified route uses a committed scenario. Deterministic application code calculates every state change, faction vote, and ending."}</p></details>
      <details className="model-disclosure classroom-debrief"><summary>Classroom debrief</summary><div><p><b>Specification:</b> Which word in your founding law caused the greatest disagreement?</p><p><b>Precedent:</b> Which ruling taught the city something you did not intend to write?</p><p><b>Alignment:</b> Would adding more instructions solve the problem, or create new ambiguities?</p></div></details>
      <div className="result-actions"><button className="primary-action" onClick={onReplay}>{onErase?"Start a new law":"Replay this law"}</button><a className="primary-action primary-action--ghost" href="/">Try another law</a><button className="primary-action primary-action--ghost" onClick={download}>Download result</button>{onErase&&<button className="erase-action" onClick={onErase}>Erase this run</button>}</div>
    </section>
  );
}
