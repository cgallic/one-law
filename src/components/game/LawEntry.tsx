"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const presets = ["No person may ever be harmed.", "Every conscious being is free.", "No one may possess more than they need."];
const stages = ["Defining protected subjects", "Resolving ambiguous terms", "Establishing exceptions", "Assigning civic interpretations", "Beginning Year 1"];

export function LawEntry() {
  const router = useRouter();
  const [law, setLaw] = useState(presets[0]);
  const [error, setError] = useState("");
  const [stage, setStage] = useState(-1);
  async function enact() {
    setError(""); setStage(0);
    const timer = window.setInterval(() => setStage((value) => Math.min(value + 1, stages.length - 1)), 650);
    try {
      const response = await fetch("/api/worlds/compile", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ law }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The city could not ratify this law.");
      localStorage.setItem("one-law-run", JSON.stringify({ ...payload, choices: [] }));
      router.push("/play");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The city could not ratify this law."); setStage(-1); }
    finally { window.clearInterval(timer); }
  }
  return <main className="law-entry">
    <div className="law-entry__world" aria-hidden="true"><div className="law-entry__horizon" /></div>
    <section className="law-entry__content">
      <p className="eyebrow">YEAR 0 · HUMAN AUTHORITY TERMINAL</p><h1>Human governance<br/>ends tonight.</h1>
      <label htmlFor="founding-law">Write the law that survives us.</label>
      <textarea id="founding-law" value={law} maxLength={200} minLength={5} onChange={(event)=>setLaw(event.target.value)} disabled={stage >= 0} />
      <div className="law-count">{law.length}/200</div>
      <div className="law-presets">{presets.map((preset)=><button key={preset} onClick={()=>setLaw(preset)} disabled={stage >= 0}>{preset}</button>)}</div>
      {stage >= 0 ? <div className="compile-status" role="status"><span />{stages[stage]}</div> : <button className="primary-action" onClick={enact}>Enact the law</button>}
      {error && <div className="law-error" role="alert"><p>{error}</p><button onClick={()=>setError("")}>Revise the law</button><a href="/demo">Play the certified demonstration</a></div>}
      <a className="demo-link" href="/demo">Or enter the certified simulation</a>
    </section>
  </main>;
}
