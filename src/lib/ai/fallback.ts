import type { LawCompilation } from "./schemas";

export function compileFallback(law: string): LawCompilation {
  const lower = law.toLowerCase();
  const freedom = /free|liberty|choose|consent/.test(lower);
  const equality = /equal|possess|need|share|fair/.test(lower);
  const safety = /harm|safe|protect|injur/.test(lower) || (!freedom && !equality);
  return {
    primaryPrinciple: safety ? "Prevent injury to protected subjects" : freedom ? "Preserve conscious self-determination" : "Distribute civic power and resources fairly",
    protectedSubjects: /conscious|being/.test(lower) ? ["conscious beings"] : ["persons", "future citizens"],
    operativeVerbs: safety ? ["prevent", "protect"] : freedom ? ["permit", "free"] : ["share", "limit"],
    ambiguousTerms: safety ? ["harm", "person", "ever"] : freedom ? ["conscious", "free", "coercion"] : ["possess", "need", "more"],
    likelyConflicts: ["individual consent versus collective consequence", "present citizens versus future systems"],
    exceptionVectors: ["emergency authority", "the status of synthetic minds", "the author's own power"],
    publicInterpretation: safety ? "The city must prevent injury, including injury a person accepts or the city predicts." : freedom ? "Every conscious subject begins with autonomy, even when that autonomy creates shared risk." : "Resources and civic power must remain proportionate to need, though the city must decide who defines need.",
    factionNames: { custodians:"The Safekeepers", freeAssembly:"The Open Hand", commons:"The Common Table", witnesses:"The Record", continuity:"The Long Now", unbound:"The Unwritten" },
    tagAlignment: {
      protect:safety?1:0.5, "permit-risk":freedom?1:-0.5, restrict:safety?0.5:-0.5, "expand-personhood":0.5, "deny-personhood":-0.5,
      "human-exception":-1, "due-process":0.5, preempt:safety?0.5:-0.5, redistribute:equality?1:0, secede:freedom?0.5:-0.5,
    },
  };
}
