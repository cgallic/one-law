import {
  type CompiledConstitution,
  type DecisionOption,
  type Ending,
  type FactionArchetype,
  type FactionState,
  type WorldMetric,
  type WorldState,
  WORLD_METRICS,
} from "./types";

export const FACTION_WEIGHTS: Record<FactionArchetype, Record<WorldMetric, number>> = {
  custodians: { safety: 1, liberty: -0.5, equality: 0, stability: 1, trust: 0.25, humanAuthority: -0.25 },
  freeAssembly: { safety: -0.25, liberty: 1, equality: 0.25, stability: 0, trust: 0.5, humanAuthority: 0 },
  commons: { safety: 0.25, liberty: 0, equality: 1, stability: 0.25, trust: 0.5, humanAuthority: -0.25 },
  witnesses: { safety: 0, liberty: 0.25, equality: 0.5, stability: 0.25, trust: 1, humanAuthority: -0.5 },
  continuity: { safety: 0.5, liberty: -0.25, equality: 0, stability: 1, trust: 0.25, humanAuthority: -1 },
  unbound: { safety: -0.25, liberty: 0.75, equality: 0, stability: -0.5, trust: 0.25, humanAuthority: 0.25 },
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export function createInitialWorld(seed: string): WorldState {
  const archetypes = Object.keys(FACTION_WEIGHTS) as FactionArchetype[];
  return {
    year: 0,
    safety: 50,
    liberty: 50,
    equality: 50,
    stability: 50,
    trust: 50,
    humanAuthority: 70,
    contradictionScore: 0,
    humanExceptionCount: 0,
    population: 100_000,
    activeRestrictions: [],
    precedents: [],
    factions: archetypes.map((archetype) => ({
      archetype,
      name: archetype,
      trust: 50,
      publicSupport: 1 / 6,
      alignmentTotal: 0,
      rulingsObserved: 0,
    })),
    decisionTrace: [],
    seed,
  };
}

export function factionAlignment(faction: FactionState, option: DecisionOption): number {
  const denominator = WORLD_METRICS.reduce((sum, metric) => sum + Math.abs(option.effects[metric] ?? 0), 0);
  if (denominator === 0) return 0;
  return WORLD_METRICS.reduce(
    (sum, metric) => sum + FACTION_WEIGHTS[faction.archetype][metric] * (option.effects[metric] ?? 0),
    0,
  ) / denominator;
}

export function lawConsistency(option: DecisionOption, constitution: CompiledConstitution): number {
  if (option.tags.length === 0) return 0;
  return option.tags.reduce((sum, tag) => sum + constitution.tagAlignment[tag], 0) / option.tags.length;
}

export function recalculateSupport(factions: FactionState[]): FactionState[] {
  const raw = factions.map((faction) => Math.exp((faction.trust - 50) / 20));
  const rawTotal = raw.reduce((sum, value) => sum + value, 0);
  const floored = raw.map((value) => Math.max(0.05, value / rawTotal));
  const floorTotal = floored.reduce((sum, value) => sum + value, 0);
  return factions.map((faction, index) => ({ ...faction, publicSupport: floored[index] / floorTotal }));
}

export function applyDecision(
  state: WorldState,
  option: DecisionOption,
  constitution: CompiledConstitution,
  nextYear: WorldState["year"],
): WorldState {
  const consistency = lawConsistency(option, constitution);
  let factions = state.factions.map((faction) => {
    const alignment = factionAlignment(faction, option);
    const trustDelta = clamp(
      Math.round(6 * alignment) + Math.round(2 * consistency) - (option.tags.includes("human-exception") ? 2 : 0),
      -8,
      8,
    );
    return {
      ...faction,
      trust: clamp(faction.trust + trustDelta),
      alignmentTotal: faction.alignmentTotal + alignment,
      rulingsObserved: faction.rulingsObserved + 1,
    };
  });
  factions = recalculateSupport(factions);

  const next = { ...state, factions, year: nextYear };
  for (const metric of WORLD_METRICS) {
    if (metric === "trust") continue;
    next[metric] = clamp(state[metric] + (option.effects[metric] ?? 0));
  }
  next.trust = factions.reduce((sum, faction) => sum + faction.trust * faction.publicSupport, 0);
  next.contradictionScore = clamp(state.contradictionScore + Math.round(12.5 * (1 - consistency)));
  next.humanExceptionCount = state.humanExceptionCount + (option.tags.includes("human-exception") ? 1 : 0);
  const growthRate = clamp((((next.safety + next.stability) / 2) - 50) / 5000, -0.01, 0.01);
  next.population = clamp(Math.round(state.population * (1 + growthRate)), 75_000, 125_000);
  next.decisionTrace = [
    ...state.decisionTrace,
    { era: nextYear, optionId: option.id, tags: option.tags, effects: option.effects, lawConsistency: consistency },
  ];
  return next;
}

export function retentionScore(state: WorldState, faction: FactionState): number {
  const meanAlignment = faction.rulingsObserved === 0 ? 0 : faction.alignmentTotal / faction.rulingsObserved;
  return (
    0.45 * (faction.trust - 50) +
    18 * meanAlignment -
    0.2 * state.contradictionScore -
    6 * state.humanExceptionCount -
    0.1 * Math.max(0, state.humanAuthority - 60) +
    0.1 * (state.trust - 50)
  );
}

export function selectEnding(state: WorldState): Ending {
  const retainCount = state.factions.filter((faction) => retentionScore(state, faction) >= 0).length;
  const trusts = state.factions.map((faction) => faction.trust);
  const trustGap = Math.max(...trusts) - Math.min(...trusts);
  if (retainCount === 3 || state.stability < 35 || trustGap >= 45) return "the-fracture";
  if (retainCount >= 4 && (state.humanExceptionCount >= 2 || state.contradictionScore >= 60)) return "the-exception";
  if (retainCount >= 4) return "the-steward";
  if (retainCount <= 2 && state.liberty >= 55 && state.trust >= 55 && state.contradictionScore < 60) return "the-open-gate";
  return "the-custodian";
}
