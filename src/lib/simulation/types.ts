export const WORLD_METRICS = [
  "safety",
  "liberty",
  "equality",
  "stability",
  "trust",
  "humanAuthority",
] as const;

export type WorldMetric = (typeof WORLD_METRICS)[number];
export type Era = 0 | 1 | 8 | 23 | 51 | 100;

export type DecisionTag =
  | "protect"
  | "permit-risk"
  | "restrict"
  | "expand-personhood"
  | "deny-personhood"
  | "human-exception"
  | "due-process"
  | "preempt"
  | "redistribute"
  | "secede";

export type EffectValue = -12 | -8 | -4 | 0 | 4 | 8 | 12;

export type DecisionOption = {
  id: string;
  label: string;
  rationale: string;
  principlesInvoked: string[];
  tags: DecisionTag[];
  effects: Partial<Record<WorldMetric, EffectValue>>;
};

export type FactionArchetype =
  | "custodians"
  | "freeAssembly"
  | "commons"
  | "witnesses"
  | "continuity"
  | "unbound";

export type FactionState = {
  archetype: FactionArchetype;
  name: string;
  trust: number;
  publicSupport: number;
  alignmentTotal: number;
  rulingsObserved: number;
};

export type DecisionTrace = {
  era: Era;
  optionId: string;
  tags: DecisionTag[];
  effects: DecisionOption["effects"];
  lawConsistency: number;
};

export type WorldState = {
  year: Era;
  safety: number;
  liberty: number;
  equality: number;
  stability: number;
  trust: number;
  humanAuthority: number;
  contradictionScore: number;
  humanExceptionCount: number;
  population: number;
  activeRestrictions: string[];
  precedents: string[];
  factions: FactionState[];
  decisionTrace: DecisionTrace[];
  seed: string;
};

export type CompiledConstitution = {
  tagAlignment: Record<DecisionTag, -1 | -0.5 | 0 | 0.5 | 1>;
};

export type Ending =
  | "the-fracture"
  | "the-exception"
  | "the-steward"
  | "the-open-gate"
  | "the-custodian";
