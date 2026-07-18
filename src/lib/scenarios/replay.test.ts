import { describe, expect, it } from "vitest";
import { CANONICAL_CHOICES, CANONICAL_CRISES } from "./canonical";
import { replayCanonical } from "./replay";
import { validateDecisionOptions } from "../simulation/validation";

describe("canonical cached run", () => {
  it("contains five valid three-option crises", () => {
    expect(CANONICAL_CRISES).toHaveLength(5);
    for (const crisis of CANONICAL_CRISES) expect(validateDecisionOptions(crisis.options)).toEqual({ valid: true, issues: [] });
  });
  it("replays the same seed and choices deterministically", () => {
    expect(replayCanonical(CANONICAL_CHOICES)).toEqual(replayCanonical(CANONICAL_CHOICES));
  });
  it("rejects a choice from the wrong era", () => expect(() => replayCanonical(["y8-reset"])).toThrow(/does not belong/));
  it("finishes at year 100 with six votes and one ending", () => {
    const result = replayCanonical(CANONICAL_CHOICES);
    expect(result.state.year).toBe(100);
    expect(result.state.decisionTrace).toHaveLength(5);
    expect(result.votes).toHaveLength(6);
    expect(result.ending).toMatch(/^the-/);
  });
});
