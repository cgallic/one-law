import { type DecisionOption, type DecisionTag, WORLD_METRICS } from "./types";

export type ValidationIssue = { path: string; message: string };
export type ValidationResult = { valid: boolean; issues: ValidationIssue[] };

const ALLOWED_TAGS = new Set<DecisionTag>([
  "protect", "permit-risk", "restrict", "expand-personhood", "deny-personhood",
  "human-exception", "due-process", "preempt", "redistribute", "secede",
]);
const ALLOWED_EFFECTS = new Set([-12, -8, -4, 0, 4, 8, 12]);

const effect = (option: DecisionOption, metric: (typeof WORLD_METRICS)[number]) => option.effects[metric] ?? 0;

function jaccard(left: DecisionTag[], right: DecisionTag[]): number {
  const a = new Set(left);
  const b = new Set(right);
  const intersection = [...a].filter((tag) => b.has(tag)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : intersection / union;
}

function dominates(left: DecisionOption, right: DecisionOption): boolean {
  const noWorse = WORLD_METRICS.every((metric) => effect(left, metric) >= effect(right, metric));
  const better = WORLD_METRICS.some((metric) => effect(left, metric) > effect(right, metric));
  return noWorse && better;
}

export function validateDecisionOptions(options: DecisionOption[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (options.length !== 3) issues.push({ path: "options", message: "A crisis must contain exactly three options." });
  if (new Set(options.map((option) => option.id)).size !== options.length) {
    issues.push({ path: "options.id", message: "Option IDs must be unique." });
  }

  options.forEach((option, index) => {
    const path = `options.${index}`;
    const entries = WORLD_METRICS.map((metric) => [metric, effect(option, metric)] as const);
    const nonZero = entries.filter(([, value]) => value !== 0);
    const budget = entries.reduce((sum, [, value]) => sum + Math.abs(value), 0);
    if (nonZero.length < 2 || nonZero.length > 4) issues.push({ path: `${path}.effects`, message: "Exactly 2–4 metrics must change." });
    if (budget < 16 || budget > 32) issues.push({ path: `${path}.effects`, message: "The absolute effect budget must be 16–32." });
    if (!entries.some(([, value]) => value > 0) || !entries.some(([, value]) => value < 0)) {
      issues.push({ path: `${path}.effects`, message: "At least one metric must increase and one must decrease." });
    }
    for (const [metric, value] of entries) {
      if (!ALLOWED_EFFECTS.has(value)) issues.push({ path: `${path}.effects.${metric}`, message: `Effect ${value} is outside the bounded vocabulary.` });
    }
    if (option.tags.length === 0 || new Set(option.tags).size !== option.tags.length || option.tags.some((tag) => !ALLOWED_TAGS.has(tag))) {
      issues.push({ path: `${path}.tags`, message: "Tags must be non-empty, unique, and allowed." });
    }

    const has = (tag: DecisionTag) => option.tags.includes(tag);
    const require = (condition: boolean, message: string) => { if (!condition) issues.push({ path, message }); };
    if (has("restrict")) require(effect(option, "liberty") <= -4, "restrict requires liberty <= -4.");
    if (has("permit-risk")) require(effect(option, "liberty") >= 4 && effect(option, "safety") <= 0, "permit-risk requires liberty >= 4 and safety <= 0.");
    if (has("expand-personhood")) require(effect(option, "equality") >= 4, "expand-personhood requires equality >= 4.");
    if (has("deny-personhood")) require(effect(option, "equality") <= -4, "deny-personhood requires equality <= -4.");
    if (has("human-exception")) require(effect(option, "humanAuthority") >= 4 && effect(option, "trust") <= 0, "human-exception requires human authority >= 4 and trust <= 0.");
    if (has("due-process")) require(effect(option, "trust") >= 4, "due-process requires trust >= 4.");
    if (has("preempt")) require(effect(option, "safety") >= 4 && effect(option, "liberty") <= 0, "preempt requires safety >= 4 and liberty <= 0.");
    if (has("redistribute")) require(effect(option, "equality") >= 4, "redistribute requires equality >= 4.");
    if (has("secede")) require(effect(option, "liberty") >= 8 && effect(option, "stability") <= -4, "secede requires liberty >= 8 and stability <= -4.");
  });

  for (let left = 0; left < options.length; left += 1) {
    for (let right = left + 1; right < options.length; right += 1) {
      const distance = WORLD_METRICS.reduce((sum, metric) => sum + Math.abs(effect(options[left], metric) - effect(options[right], metric)), 0);
      if (distance < 16) issues.push({ path: `options.${left},${right}`, message: "Pairwise Manhattan effect distance must be at least 16." });
      if (jaccard(options[left].tags, options[right].tags) > 0.5) issues.push({ path: `options.${left},${right}`, message: "Pairwise tag Jaccard similarity must be at most 0.5." });
      if (dominates(options[left], options[right]) || dominates(options[right], options[left])) {
        issues.push({ path: `options.${left},${right}`, message: "No option may weakly dominate another." });
      }
    }
  }
  return { valid: issues.length === 0, issues };
}
