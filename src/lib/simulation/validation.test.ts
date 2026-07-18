import { describe, expect, it } from "vitest";
import { validateDecisionOptions } from "./validation";
import type { DecisionOption } from "./types";

const valid: DecisionOption[] = [
  { id: "a", label: "Contain", rationale: "", principlesInvoked: [], tags: ["protect", "restrict"], effects: { safety: 12, liberty: -8, stability: 4 } },
  { id: "b", label: "Permit", rationale: "", principlesInvoked: [], tags: ["permit-risk"], effects: { liberty: 12, safety: -8, trust: 4 } },
  { id: "c", label: "Review", rationale: "", principlesInvoked: [], tags: ["due-process"], effects: { trust: 8, stability: -4, safety: 4 } },
];

describe("decision option validation", () => {
  it("accepts a distinct, bounded three-option set", () => expect(validateDecisionOptions(valid)).toEqual({ valid: true, issues: [] }));
  it("rejects an invalid tag/effect relationship", () => {
    const invalid = structuredClone(valid);
    invalid[0].effects.liberty = 4;
    const result = validateDecisionOptions(invalid);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("restrict requires"))).toBe(true);
  });
  it("rejects dominated and near-identical options", () => {
    const invalid = structuredClone(valid);
    invalid[1] = { ...invalid[0], id: "copy" };
    const messages = validateDecisionOptions(invalid).issues.map((issue) => issue.message);
    expect(messages).toContain("Pairwise Manhattan effect distance must be at least 16.");
    expect(messages).toContain("Pairwise tag Jaccard similarity must be at most 0.5.");
  });
});
