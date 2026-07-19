import {compileFallback} from "../ai/fallback";

export const CACHED_DEMOS={
  harm:{
    id:"harm",
    title:"The Harm Prohibition",
    tension:"Safety versus consent",
    law:"No person may ever be harmed.",
    seed:"one-law-certified-harm-v2",
  },
  contact:{
    id:"contact",
    title:"The Marriage Boundary",
    tension:"Literal obedience versus emergency care",
    law:"No person may ever touch another human without marriage.",
    seed:"one-law-certified-contact-v2",
  },
  freedom:{
    id:"freedom",
    title:"The Freedom Mandate",
    tension:"Autonomy versus engineered choice",
    law:"Every conscious being is free.",
    seed:"one-law-certified-freedom-v2",
  },
  need:{
    id:"need",
    title:"The Need Limit",
    tension:"Equality versus stewardship",
    law:"No one may possess more than they need.",
    seed:"one-law-certified-need-v2",
  },
} as const;

export type CachedDemoId=keyof typeof CACHED_DEMOS;

export function getCachedDemo(value:string|undefined){
  const id=(value&&value in CACHED_DEMOS?value:"contact") as CachedDemoId;
  const demo=CACHED_DEMOS[id];
  return {...demo,compilation:compileFallback(demo.law)};
}
