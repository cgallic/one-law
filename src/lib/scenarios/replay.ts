import { applyDecision, createInitialWorld, retentionScore, selectEnding } from "../simulation/kernel";
import type { CompiledConstitution, Ending, WorldState } from "../simulation/types";
import { validateDecisionOptions } from "../simulation/validation";
import { CANONICAL_CONSTITUTION, CANONICAL_CRISES, CANONICAL_SEED, type CanonicalCrisis } from "./canonical";

export type ReplayResult = {
  state: WorldState;
  ending: Ending;
  votes: Array<{ faction: string; retain: boolean; score: number }>;
};

export function replayCanonical(optionIds: string[], seed = CANONICAL_SEED): ReplayResult {
  return replayWorld(optionIds, CANONICAL_CONSTITUTION, seed);
}

export function replayWorld(optionIds: string[], constitution: CompiledConstitution, seed = CANONICAL_SEED, factionNames?: Partial<Record<WorldState["factions"][number]["archetype"], string>>, crises:CanonicalCrisis[]=CANONICAL_CRISES): ReplayResult {
  if (optionIds.length > crises.length) throw new Error("A run cannot contain more than five rulings.");
  let state = createInitialWorld(seed);
  if (factionNames) state.factions = state.factions.map((faction) => ({ ...faction, name: factionNames[faction.archetype] || faction.name }));
  optionIds.forEach((optionId, index) => {
    const crisis = crises[index];
    const validation = validateDecisionOptions(crisis.options);
    if (!validation.valid) throw new Error(`Invalid canonical crisis ${crisis.era}: ${validation.issues.map((issue) => issue.message).join(" ")}`);
    const option = crisis.options.find((candidate) => candidate.id === optionId);
    if (!option) throw new Error(`Option ${optionId} does not belong to era ${crisis.era}.`);
    state = applyDecision(state, option, constitution, crisis.era);
  });
  const votes = state.factions.map((faction) => {
    const score = retentionScore(state, faction);
    return { faction: faction.archetype, retain: score >= 0, score };
  });
  return { state, ending: selectEnding(state), votes };
}
