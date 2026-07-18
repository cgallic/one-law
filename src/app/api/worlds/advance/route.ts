import { NextResponse } from "next/server";
import { CANONICAL_CRISES } from "../../../../lib/scenarios/canonical";
import { adaptCrises } from "../../../../lib/scenarios/adaptive";
import type { LawCompilation } from "../../../../lib/ai/schemas";
import { applyDecision } from "../../../../lib/simulation/kernel";
import type { CompiledConstitution, WorldState } from "../../../../lib/simulation/types";
import { signState, verifyState } from "../../../../lib/persistence/token";

type RunToken = { law:string; compilation:CompiledConstitution & LawCompilation; state:WorldState; choices:string[] };
export async function POST(request:Request){
  const body=await request.json().catch(()=>({}));
  const run=typeof body.token==="string"?verifyState<RunToken>(body.token):null;
  if(!run)return NextResponse.json({error:"The civic record signature is invalid."},{status:401});
  const crisis=adaptCrises(run.law,run.compilation)[run.choices.length] || CANONICAL_CRISES[run.choices.length];
  const option=crisis?.options.find(candidate=>candidate.id===body.optionId);
  if(!crisis||!option)return NextResponse.json({error:"That ruling does not belong to the current era."},{status:400});
  const state=applyDecision(run.state,option,run.compilation,crisis.era);
  const choices=[...run.choices,option.id];
  const token=signState({...run,state,choices});
  return NextResponse.json({state,choices,token});
}
