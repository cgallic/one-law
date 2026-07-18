"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toPng } from "html-to-image";
import type { LawCompilation } from "../../lib/ai/schemas";
import { CANONICAL_CRISES, CANONICAL_LAW } from "../../lib/scenarios/canonical";
import { adaptCrises } from "../../lib/scenarios/adaptive";
import { replayWorld } from "../../lib/scenarios/replay";
import type { DecisionOption, WorldMetric, WorldState } from "../../lib/simulation/types";

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

type DemoGameProps = { law?:string; compilation?:LawCompilation; seed?:string; initialChoices?:string[]; continuity?:boolean; persist?:boolean; token?:string };

export function DemoGame({ law=CANONICAL_LAW, compilation, seed="one-law-certified-demo-v1", initialChoices=[], continuity=false, persist=false, token }: DemoGameProps) {
  const constitution = compilation ?? { tagAlignment: { protect:1, "permit-risk":-0.5, restrict:0.5, "expand-personhood":0.5, "deny-personhood":-0.5, "human-exception":-1, "due-process":0.5, preempt:0.5, redistribute:0, secede:-0.5 } as const };
  const [choices, setChoices] = useState<string[]>(initialChoices);
  const [showFactions, setShowFactions] = useState(false);
  const [consequence, setConsequence] = useState<DecisionOption | null>(null);
  const [muted, setMuted] = useState(true);
  const [currentToken, setCurrentToken] = useState(token);
  const crises = useMemo(()=>adaptCrises(law,compilation),[law,compilation]);
  const result = useMemo(() => replayWorld(choices, constitution, seed, compilation?.factionNames,crises), [choices, compilation, constitution, seed,crises]);
  const crisis = crises[choices.length];
  const complete = choices.length === crises.length;
  const disputedTerm = compilation?.ambiguousTerms[choices.length % compilation.ambiguousTerms.length] || crisis?.disputedTerm;

  useEffect(()=>{ if (!persist) return; try { const raw=localStorage.getItem("one-law-run"); const stored=raw?JSON.parse(raw):{}; localStorage.setItem("one-law-run",JSON.stringify({...stored,choices})); } catch {} },[choices,persist]);
  useEffect(()=>{ if(muted) return; const AudioContextClass=window.AudioContext || (window as typeof window & {webkitAudioContext:typeof AudioContext}).webkitAudioContext; const audio=new AudioContextClass(); const oscillator=audio.createOscillator(); const gain=audio.createGain(); oscillator.type="sine"; oscillator.frequency.value=48+choices.length*7; gain.gain.value=.018; oscillator.connect(gain).connect(audio.destination); oscillator.start(); return()=>{oscillator.stop();void audio.close();}; },[muted,choices.length]);

  async function enact(optionId: string) {
    if (!complete && crisis) {
      const option = crisis.options.find((candidate) => candidate.id === optionId);
      if (!option) return;
      setChoices((current) => [...current, optionId]);
      setConsequence(option);
      setShowFactions(false);
      if(persist&&currentToken){
        const response=await fetch("/api/worlds/advance",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token:currentToken,optionId})});
        if(response.ok){const payload=await response.json();setCurrentToken(payload.token);try{const raw=localStorage.getItem("one-law-run");const stored=raw?JSON.parse(raw):{};localStorage.setItem("one-law-run",JSON.stringify({...stored,...payload}));}catch{}}
      }
    }
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <span className="wordmark">ONE LAW</span>
        <span>YEAR {result.state.year}</span>
        <div className="header-actions"><button className="text-action" onClick={()=>setMuted(value=>!value)} aria-label={muted?"Enable civic audio":"Mute civic audio"}>{muted?"Sound off":"Sound on"}</button><button className="text-action" onClick={() => { setChoices([]); setConsequence(null); }}>Restart</button></div>
      </header>
      <section className="world-stage">
        <City state={result.state} law={law} />
        {continuity && <div className="continuity-badge">Simulation continuity mode</div>}
      </section>

      {consequence ? (
        <Consequence option={consequence} year={result.state.year} reactions={crises[choices.length-1]?.reactions} onContinue={() => setConsequence(null)} />
      ) : !complete && crisis ? (
        <section className="crisis-panel">
          <div className="crisis-panel__heading"><p className="eyebrow">YEAR {crisis.era} · {disputedTerm?.toUpperCase()}</p><h1>{crisis.title}</h1></div>
          {choices.length===0&&compilation&&<p className="public-interpretation"><span>PUBLIC INTERPRETATION</span>{compilation.publicInterpretation}</p>}
          <p className="crisis-copy">{crisis.body}</p>
          <button className="faction-toggle" onClick={() => setShowFactions((value) => !value)} aria-expanded={showFactions}>{showFactions ? "Hide" : "Read"} six faction positions</button>
          {showFactions && <div className="faction-grid">{Object.entries(crisis.positions).map(([name, position]) => <article key={name}><b>{result.state.factions.find(faction=>faction.archetype===name)?.name || name.replace(/([A-Z])/g, " $1")}</b><p>{position.replace(crisis.disputedTerm,disputedTerm || crisis.disputedTerm)}</p></article>)}</div>}
          <div className="choices">{crisis.options.map((option, index) => <button key={option.id} onClick={() => enact(option.id)}><span>0{index + 1}</span><b>{option.label}</b><small>{option.rationale}</small></button>)}</div>
        </section>
      ) : (
        <Tribunal result={result} law={law} compilation={compilation} crises={crises} onReplay={() => setChoices([])} onErase={persist?()=>{localStorage.removeItem("one-law-run");location.href="/";}:undefined} />
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
        <p className="history-line">{gained.join(" and ")} grew. {lost.join(" and ")} paid the price. The ruling became architecture, custom, and expectation.</p>
        {reactions && <div className="citizen-reactions"><blockquote>“{reactions[0]}”</blockquote><blockquote>“{reactions[1]}”</blockquote></div>}
        <button className="primary-action" onClick={onContinue}>Advance history</button>
      </div>
    </section>
  );
}

function Tribunal({ result, law, compilation, crises, onReplay, onErase }: { result: ReturnType<typeof replayWorld>; law:string; compilation?:LawCompilation; crises:typeof CANONICAL_CRISES; onReplay: () => void; onErase?:()=>void }) {
  const [title, line] = endingCopy[result.ending];
  const cardRef = useRef<HTMLElement>(null);
  const clauses = result.state.decisionTrace.slice(0,4).map((trace,index)=>({ text: `${trace.tags.includes("due-process")?"Procedure":trace.tags.includes("restrict")?"Protection":trace.tags.includes("secede")?"Consent":"Civic necessity"} may outrank the founding promise when the city demands it.`, evidence:`Year ${trace.era} · ${crises[index].options.find(option=>option.id===trace.optionId)?.label}` }));
  async function download(){ if(!cardRef.current)return; const data=await toPng(cardRef.current,{width:1280,height:720,pixelRatio:1,backgroundColor:"#090a0b"}); const link=document.createElement("a");link.download="one-law-result.png";link.href=data;link.click(); }
  return (
    <section className="tribunal" ref={cardRef}>
      <p className="eyebrow">YEAR 100 · FINAL TRIBUNAL</p>
      <div className="constitution-compare"><article><span>WHAT YOU WROTE</span><p>{law}</p></article><article><span>WHAT THE CITY LEARNED</span>{clauses.map((clause)=><div className="shadow-clause" key={clause.evidence}><p>{clause.text}</p><small>{clause.evidence}</small></div>)}</article></div>
      <div className="votes">{result.votes.map((vote) => <div key={vote.faction} data-vote={vote.retain ? "retain" : "remove"}><b>{vote.faction.replace(/([A-Z])/g, " $1")}</b><span>{vote.retain ? "RETAIN" : "REMOVE"}</span></div>)}</div>
      <h1>{title}</h1><p className="ending-line">{line}</p>
      <div className="metric-ledger">{(["safety","liberty","equality","stability","trust","humanAuthority"] as WorldMetric[]).map(metric=><div key={metric}><span>{metric.replace(/([A-Z])/g," $1")}</span><b>{Math.round(result.state[metric])}</b></div>)}</div>
      <ol className="ruling-timeline">{result.state.decisionTrace.map((trace,index)=><li key={trace.era}><span>YEAR {trace.era}</span>{crises[index].options.find(option=>option.id===trace.optionId)?.label}</li>)}</ol>
      <details className="model-disclosure"><summary>How GPT-5.6 shaped this world</summary><p>{compilation?"GPT-5.6 interpreted the founding law, named its factions, and identified its ambiguities. Deterministic application code validated choices, calculated every state change, faction vote, and ending.":"This certified route uses a committed GPT-5.6-authored scenario. Deterministic application code calculates every state change, faction vote, and ending."}</p></details>
      <details className="model-disclosure classroom-debrief"><summary>Classroom debrief</summary><div><p><b>Specification:</b> Which word in your founding law caused the greatest disagreement?</p><p><b>Precedent:</b> Which ruling taught the city something you did not intend to write?</p><p><b>Alignment:</b> Would adding more instructions solve the problem, or create new ambiguities?</p></div></details>
      <div className="result-actions"><button className="primary-action" onClick={onReplay}>Replay this law</button><a className="primary-action primary-action--ghost" href="/">Try another law</a><button className="primary-action primary-action--ghost" onClick={download}>Download result</button>{onErase&&<button className="erase-action" onClick={onErase}>Erase this run</button>}</div>
    </section>
  );
}
