import OpenAI from "openai";
import {NextResponse} from "next/server";
import {applyDecision} from "../../../../lib/simulation/kernel";
import type {WorldState} from "../../../../lib/simulation/types";
import type {GeneratedCrisis,LawCompilation} from "../../../../lib/ai/schemas";
import {generateCrisis} from "../../../../lib/ai/crisis";
import {signState,verifyState} from "../../../../lib/persistence/token";
import {createModelClient,modelConfig} from "../../../../lib/ai/client";

type RunToken={law:string;compilation:LawCompilation;state:WorldState;choices:string[];currentCrisis:GeneratedCrisis;continuity:boolean};
const eras=[1,8,23,51,100] as const;

export async function POST(request:Request){
  const started=Date.now();
  const body=await request.json().catch(()=>({}));
  const run=typeof body.token==="string"?verifyState<RunToken>(body.token):null;
  if(!run)return NextResponse.json({error:"The civic record signature is invalid."},{status:401});
  const option=run.currentCrisis.options.find(candidate=>candidate.id===body.optionId);
  if(!option)return NextResponse.json({error:"That ruling does not belong to the current era."},{status:400});
  const state=applyDecision(run.state,option,run.compilation,run.currentCrisis.era);
  state.precedents=[...state.precedents,`${run.currentCrisis.title}: ${option.label}`];
  const choices=[...run.choices,option.id];
  const nextEra=eras[choices.length];
  let currentCrisis:GeneratedCrisis|null=null;
  let continuity=run.continuity;
  if(nextEra){
    const client=createModelClient();
    if(!client)return NextResponse.json({error:"The city lost contact with its interpreter.",recovery:"demo"},{status:503});
    const generated=await generateCrisis({client,model:modelConfig("crisis").model,law:run.law,compilation:run.compilation,state,era:nextEra});
    currentCrisis=generated.crisis;
    continuity=continuity||generated.mode==="continuity";
  }
  const token=signState({...run,state,choices,currentCrisis,continuity});
  return NextResponse.json({state,choices,currentCrisis,token,mode:continuity?"continuity":"live",latencyMs:Date.now()-started});
}
