import { NextResponse } from "next/server";
import { retentionScore, selectEnding } from "../../../../lib/simulation/kernel";
import type { CompiledConstitution, WorldState } from "../../../../lib/simulation/types";
import { verifyState } from "../../../../lib/persistence/token";
type RunToken={law:string;compilation:CompiledConstitution;state:WorldState;choices:string[]};
export async function POST(request:Request){
 const body=await request.json().catch(()=>({}));const run=typeof body.token==="string"?verifyState<RunToken>(body.token):null;
 if(!run)return NextResponse.json({error:"The civic record signature is invalid."},{status:401});
 if(run.choices.length!==5)return NextResponse.json({error:"The tribunal cannot convene before five rulings."},{status:409});
 return NextResponse.json({ending:selectEnding(run.state),votes:run.state.factions.map(faction=>({faction:faction.name,retain:retentionScore(run.state,faction)>=0,score:retentionScore(run.state,faction)}))});
}
