import { describe, expect, it } from "vitest";
import { applyDecision, createInitialWorld, selectEnding } from "./kernel";
import type { CompiledConstitution, DecisionOption, WorldState } from "./types";

const constitution: CompiledConstitution = {
  tagAlignment: {
    protect: 1,
    "permit-risk": -1,
    restrict: 0.5,
    "expand-personhood": 1,
    "deny-personhood": -1,
    "human-exception": -1,
    "due-process": 0.5,
    preempt: 0,
    redistribute: 0.5,
    secede: -0.5,
  },
};

const option: DecisionOption = {
  id: "protect-and-restrict",
  label: "Restrict the work",
  rationale: "Safety outweighs voluntary exposure.",
  principlesInvoked: ["prevent harm"],
  tags: ["protect", "restrict"],
  effects: { safety: 12, liberty: -8, stability: 4 },
};

describe("simulation kernel", () => {
  it("creates the exact PRD initial state", () => {
    const state = createInitialWorld("seed-1");
    expect(state).toMatchObject({ safety: 50, liberty: 50, equality: 50, stability: 50, trust: 50, humanAuthority: 70, population: 100_000 });
    expect(state.factions).toHaveLength(6);
  });

  it("applies validated effects and records a deterministic trace", () => {
    const next = applyDecision(createInitialWorld("seed-1"), option, constitution, 1);
    expect(next.safety).toBe(62);
    expect(next.liberty).toBe(42);
    expect(next.stability).toBe(54);
    expect(next.decisionTrace[0].optionId).toBe(option.id);
    expect(next.factions.reduce((sum, faction) => sum + faction.publicSupport, 0)).toBeCloseTo(1);
  });

  it("selects Fracture first on a tied vote", () => {
    const state = createInitialWorld("tie");
    state.factions.forEach((faction, index) => {
      faction.trust = index < 3 ? 100 : 0;
      faction.rulingsObserved = 1;
      faction.alignmentTotal = index < 3 ? 1 : -1;
    });
    expect(selectEnding(state)).toBe("the-fracture");
  });

  it("selects Exception before Steward at the exception boundary", () => {
    const state = createInitialWorld("exception");
    state.humanExceptionCount = 2;
    state.factions.forEach((faction) => { faction.trust = 100; });
    expect(selectEnding(state)).toBe("the-exception");
  });

  it("uses Custodian as the exhaustive default", () => {
    const state = createInitialWorld("custodian") as WorldState;
    state.liberty = 40;
    state.trust = 40;
    state.contradictionScore = 40;
    state.factions.forEach((faction) => { faction.trust = 0; faction.rulingsObserved = 1; faction.alignmentTotal = -1; });
    expect(selectEnding(state)).toBe("the-custodian");
  });
});
