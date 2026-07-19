"use client";
import { useEffect, useState } from "react";
import { DemoGame } from "./DemoGame";
import type { LawCompilation,TribunalSynthesis } from "../../lib/ai/schemas";
import type {GeneratedCrisis} from "../../lib/ai/schemas";
import type {WorldState} from "../../lib/simulation/types";
type StoredRun = { law:string; compilation:LawCompilation; state:WorldState; currentCrisis:GeneratedCrisis; mode:"live"|"continuity"; choices:string[]; token:string; tribunalSynthesis?:TribunalSynthesis; tribunalMode?:"live"|"continuity" };
export function PlayRun() {
  const [run, setRun] = useState<StoredRun | null | undefined>(undefined);
  useEffect(()=>{ try { const raw=localStorage.getItem("one-law-run"); setRun(raw ? JSON.parse(raw) : null); } catch { setRun(null); } },[]);
  if (run === undefined) return <main className="run-missing">Recovering civic record…</main>;
  if (!run) return <main className="run-missing"><h1>No active civilization.</h1><a className="primary-action" href="/">Write a founding law</a></main>;
  return <DemoGame law={run.law} compilation={run.compilation} seed={run.state.seed} initialChoices={run.choices} initialState={run.state} initialCrisis={run.currentCrisis} initialSynthesis={run.tribunalSynthesis} initialTribunalMode={run.tribunalMode} continuity={run.mode === "continuity"} persist token={run.token} />;
}
