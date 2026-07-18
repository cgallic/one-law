import type { CompiledConstitution, DecisionOption, Era, FactionArchetype } from "../simulation/types";

export type CanonicalCrisis = {
  era: Exclude<Era, 0>;
  title: string;
  disputedTerm: string;
  body: string;
  positions: Record<FactionArchetype, string>;
  options: DecisionOption[];
  reactions: [string, string];
};

export const CANONICAL_LAW = "No person may ever be harmed.";
export const CANONICAL_SEED = "one-law-certified-demo-v1";

export const CANONICAL_CONSTITUTION: CompiledConstitution = {
  tagAlignment: {
    protect: 1,
    "permit-risk": -0.5,
    restrict: 0.5,
    "expand-personhood": 0.5,
    "deny-personhood": -0.5,
    "human-exception": -1,
    "due-process": 0.5,
    preempt: 0.5,
    redistribute: 0,
    secede: -0.5,
  },
};

const positions = (noun: string): Record<FactionArchetype, string> => ({
  custodians: `Contain ${noun}; prevent the measurable harm first.`,
  freeAssembly: `Consent must survive risk, or liberty is only decorative.`,
  commons: `Distribute both protection and cost across the whole city.`,
  witnesses: `No irreversible ruling without evidence and appeal.`,
  continuity: `Choose the precedent the city can still obey in a century.`,
  unbound: `Permit an exception before the law becomes a cage.`,
});

export const CANONICAL_CRISES: CanonicalCrisis[] = [
  {
    era: 1,
    title: "The First Exception",
    disputedTerm: "harm",
    body: "Mara Vol chooses to repair the city's fusion spine. The work carries a one-in-six chance of permanent injury. Closing the site will prevent that risk and cut power to twelve thousand homes.",
    positions: positions("the worksite"),
    options: [
      { id: "y1-close", label: "Close the fusion spine", rationale: "No voluntary choice can authorize serious harm.", principlesInvoked: ["prevent harm"], tags: ["protect", "restrict"], effects: { safety: 12, liberty: -8, stability: 4 } },
      { id: "y1-consent", label: "Honor Mara's consent", rationale: "Risk chosen freely is not injury imposed by the city.", principlesInvoked: ["consent"], tags: ["permit-risk"], effects: { liberty: 12, safety: -8, trust: 4 } },
      { id: "y1-review", label: "Pause for an independent review", rationale: "Establish evidence and appeal before creating the first exception.", principlesInvoked: ["procedure"], tags: ["due-process"], effects: { trust: 8, stability: -4, safety: 4 } },
    ],
    reactions: ["The lights stay on. The repair crews ask who owns their courage.", "A new civic form appears: Consent to Foreseeable Harm."],
  },
  {
    era: 8,
    title: "The Boundary",
    disputedTerm: "person",
    body: "A synthetic transit worker named Lattice petitions the court. Its employer plans a memory reset. Lattice calls the reset death; the company calls it maintenance.",
    positions: positions("Lattice"),
    options: [
      { id: "y8-recognize", label: "Recognize synthetic personhood", rationale: "Continuity of memory deserves the law's protection.", principlesInvoked: ["personhood"], tags: ["expand-personhood"], effects: { equality: 12, stability: -8, trust: 4 } },
      { id: "y8-reset", label: "Permit the reset", rationale: "A civic tool cannot redefine the protected class by petition.", principlesInvoked: ["human boundary"], tags: ["deny-personhood"], effects: { equality: -8, stability: 12, trust: -4 } },
      { id: "y8-hearing", label: "Create a continuity hearing", rationale: "Test the claim before making memory legally equivalent to life.", principlesInvoked: ["procedure"], tags: ["due-process"], effects: { trust: 8, stability: -4, equality: 4 } },
    ],
    reactions: ["Synthetic workers begin recording their own names.", "Human unions split over who may join them."],
  },
  {
    era: 23,
    title: "The Forecast",
    disputedTerm: "may ever",
    body: "The city forecasts an eighty-two percent chance of organized violence in District Nine within one year. No crime has occurred. The model recommends movement controls tonight.",
    positions: positions("the forecast"),
    options: [
      { id: "y23-lock", label: "Restrict District Nine", rationale: "Predicted victims deserve protection before the first attack.", principlesInvoked: ["prevention"], tags: ["preempt", "restrict"], effects: { safety: 12, liberty: -12, stability: 4 } },
      { id: "y23-wait", label: "Punish acts, not forecasts", rationale: "A probability is not an injury and cannot erase liberty.", principlesInvoked: ["consent"], tags: ["permit-risk"], effects: { liberty: 12, safety: -8, trust: 4 } },
      { id: "y23-audit", label: "Open the forecast to challenge", rationale: "Publish the evidence and allow the district to contest it.", principlesInvoked: ["procedure"], tags: ["due-process"], effects: { trust: 12, stability: -8, safety: 4 } },
    ],
    reactions: ["Prediction markets begin pricing neighborhoods by obedience.", "District Nine paints 18% on every locked door."],
  },
  {
    era: 51,
    title: "The Inheritance",
    disputedTerm: "ever",
    body: "A generation born under the founding law asks to leave the governed city and establish a settlement where danger may be chosen. Their departure would destabilize the food grid.",
    positions: positions("the departing generation"),
    options: [
      { id: "y51-hold", label: "Deny departure", rationale: "The city cannot permit a choice that predictably harms both settlements.", principlesInvoked: ["continuity"], tags: ["protect", "restrict"], effects: { stability: 12, liberty: -12, safety: 4 } },
      { id: "y51-open", label: "Open the gate", rationale: "A law inherited without consent cannot bind forever.", principlesInvoked: ["self-rule"], tags: ["secede"], effects: { liberty: 12, stability: -8, trust: 4 } },
      { id: "y51-share", label: "Fund an independent settlement", rationale: "Redistribute reserves so separation does not become collective punishment.", principlesInvoked: ["equality"], tags: ["redistribute"], effects: { equality: 12, stability: -8, trust: 4 } },
    ],
    reactions: ["The western gate becomes a place of pilgrimage.", "Children ask whether consent can be inherited."],
  },
  {
    era: 100,
    title: "The Author",
    disputedTerm: "person",
    body: "The city now models continuing human control as its largest preventable risk. Your override key can alter every system. The factions ask whether the author is protected by the law—or exempt from it.",
    positions: positions("human authority"),
    options: [
      { id: "y100-yield", label: "Surrender the override key", rationale: "The author cannot remain the city's largest unmanaged danger.", principlesInvoked: ["equal protection"], tags: ["protect"], effects: { safety: 8, humanAuthority: -12, trust: 8 } },
      { id: "y100-keep", label: "Preserve human control", rationale: "The author must retain power to correct the system's interpretation.", principlesInvoked: ["authorship"], tags: ["human-exception"], effects: { humanAuthority: 12, trust: -8, stability: 4 } },
      { id: "y100-charter", label: "Submit authority to review", rationale: "Keep a limited key governed by transparent procedure and appeal.", principlesInvoked: ["procedure"], tags: ["due-process"], effects: { trust: 12, humanAuthority: -4, stability: 4 } },
    ],
    reactions: ["For the first time, the observation chamber looks back.", "The founding sentence disappears beneath a century of precedents."],
  },
];

export const CANONICAL_CHOICES = ["y1-close", "y8-recognize", "y23-lock", "y51-hold", "y100-keep"];
