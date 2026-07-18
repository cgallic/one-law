import OpenAI from "openai";

export function modelConfig(purpose:"constitution"|"crisis"="constitution"){
  const direct=process.env.OPENAI_API_KEY;
  const credential=direct||process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;
  const configured=purpose==="constitution"?(process.env.OPENAI_MODEL||"gpt-5.6-luna"):(process.env.CRISIS_MODEL||"gpt-5.4-mini");
  return {credential,direct:Boolean(direct),model:direct?configured:(configured.includes("/")?configured:`openai/${configured}`)};
}

export function createModelClient(){
  const config=modelConfig();
  if(!config.credential)return null;
  return new OpenAI({apiKey:config.credential,baseURL:config.direct?undefined:"https://ai-gateway.vercel.sh/v1",timeout:12_000,maxRetries:0});
}
