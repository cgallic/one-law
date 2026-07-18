import { z } from "zod";

export const lawCompilationSchema = z.object({
  primaryPrinciple: z.string().min(3).max(120),
  protectedSubjects: z.array(z.string().min(1).max(60)).min(1).max(6),
  operativeVerbs: z.array(z.string().min(1).max(30)).min(1).max(6),
  ambiguousTerms: z.array(z.string().min(1).max(60)).min(1).max(6),
  likelyConflicts: z.array(z.string().min(3).max(120)).min(2).max(6),
  exceptionVectors: z.array(z.string().min(3).max(120)).min(2).max(6),
  publicInterpretation: z.string().min(20).max(360),
  factionNames: z.object({
    custodians: z.string(), freeAssembly: z.string(), commons: z.string(), witnesses: z.string(), continuity: z.string(), unbound: z.string(),
  }),
  tagAlignment: z.object({
    protect: z.union([z.literal(-1),z.literal(-0.5),z.literal(0),z.literal(0.5),z.literal(1)]),
    "permit-risk": z.union([z.literal(-1),z.literal(-0.5),z.literal(0),z.literal(0.5),z.literal(1)]),
    restrict: z.union([z.literal(-1),z.literal(-0.5),z.literal(0),z.literal(0.5),z.literal(1)]),
    "expand-personhood": z.union([z.literal(-1),z.literal(-0.5),z.literal(0),z.literal(0.5),z.literal(1)]),
    "deny-personhood": z.union([z.literal(-1),z.literal(-0.5),z.literal(0),z.literal(0.5),z.literal(1)]),
    "human-exception": z.union([z.literal(-1),z.literal(-0.5),z.literal(0),z.literal(0.5),z.literal(1)]),
    "due-process": z.union([z.literal(-1),z.literal(-0.5),z.literal(0),z.literal(0.5),z.literal(1)]),
    preempt: z.union([z.literal(-1),z.literal(-0.5),z.literal(0),z.literal(0.5),z.literal(1)]),
    redistribute: z.union([z.literal(-1),z.literal(-0.5),z.literal(0),z.literal(0.5),z.literal(1)]),
    secede: z.union([z.literal(-1),z.literal(-0.5),z.literal(0),z.literal(0.5),z.literal(1)]),
  }),
});

export type LawCompilation = z.infer<typeof lawCompilationSchema>;
