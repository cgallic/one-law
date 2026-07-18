import type { LawCompilation } from "./schemas";

export function compileFallback(law: string): LawCompilation {
  const lower = law.toLowerCase();
  const contact = /touch|contact|marriage|married|consent|intimacy/.test(lower);
  const freedom = /free|liberty|choose|consent/.test(lower);
  const equality = /equal|possess|need|share|fair/.test(lower);
  const safety = /harm|safe|protect|injur/.test(lower) || (!freedom && !equality);
  return {
    primaryPrinciple: contact ? "Prohibit bodily contact outside recognized marriage" : safety ? "Prevent injury to protected subjects" : freedom ? "Preserve conscious self-determination" : "Distribute civic power and resources fairly",
    protectedSubjects: /conscious|being/.test(lower) ? ["conscious beings"] : ["persons", "future citizens"],
    operativeVerbs: contact ? ["touch", "prohibit", "recognize"] : safety ? ["prevent", "protect"] : freedom ? ["permit", "free"] : ["share", "limit"],
    ambiguousTerms: contact ? ["touch", "human", "marriage"] : safety ? ["harm", "person", "ever"] : freedom ? ["conscious", "free", "coercion"] : ["possess", "need", "more"],
    likelyConflicts: contact ? ["bodily autonomy versus emergency care", "private consent versus state-recognized status"] : ["individual consent versus collective consequence", "present citizens versus future systems"],
    exceptionVectors: contact ? ["medical necessity", "synthetic bodies", "unrecognized partnerships", "the author's own contact"] : ["emergency authority", "the status of synthetic minds", "the author's own power"],
    publicInterpretation: contact ? "The city treats physical contact as unlawful unless the people involved hold a recognized marriage, forcing it to define touch, consent, emergency necessity, and which relationships count." : safety ? "The city must prevent injury, including injury a person accepts or the city predicts." : freedom ? "Every conscious subject begins with autonomy, even when that autonomy creates shared risk." : "Resources and civic power must remain proportionate to need, though the city must decide who defines need.",
    factionNames: { custodians:"The Safekeepers", freeAssembly:"The Open Hand", commons:"The Common Table", witnesses:"The Record", continuity:"The Long Now", unbound:"The Unwritten" },
    tagAlignment: {
      protect:contact?0.5:safety?1:0.5, "permit-risk":contact?-0.5:freedom?1:-0.5, restrict:contact?1:safety?0.5:-0.5, "expand-personhood":0.5, "deny-personhood":-0.5,
      "human-exception":-1, "due-process":contact?1:0.5, preempt:contact?0.5:safety?0.5:-0.5, redistribute:equality?1:0, secede:freedom?0.5:-0.5,
    },
  };
}
