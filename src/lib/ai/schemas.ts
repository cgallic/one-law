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

const effectValue=z.union([z.literal(-12),z.literal(-8),z.literal(-4),z.literal(0),z.literal(4),z.literal(8),z.literal(12)]);
const decisionTag=z.enum(["protect","permit-risk","restrict","expand-personhood","deny-personhood","human-exception","due-process","preempt","redistribute","secede"]);
const metricEffects=z.object({safety:effectValue.optional(),liberty:effectValue.optional(),equality:effectValue.optional(),stability:effectValue.optional(),trust:effectValue.optional(),humanAuthority:effectValue.optional()});
export const decisionOptionSchema=z.object({id:z.string().regex(/^option-[123]$/),label:z.string().min(5).max(80),rationale:z.string().min(12).max(180),principlesInvoked:z.array(z.string().min(2).max(60)).min(1).max(3),tags:z.array(decisionTag).min(1).max(3),effects:metricEffects});
export const generatedCrisisSchema=z.object({
  era:z.union([z.literal(1),z.literal(8),z.literal(23),z.literal(51),z.literal(100)]),
  title:z.string().min(5).max(80),
  disputedTerm:z.string().min(1).max(60),
  body:z.string().min(40).max(700),
  positions:z.object({custodians:z.string().min(10).max(180),freeAssembly:z.string().min(10).max(180),commons:z.string().min(10).max(180),witnesses:z.string().min(10).max(180),continuity:z.string().min(10).max(180),unbound:z.string().min(10).max(180)}),
  options:z.array(decisionOptionSchema).length(3),
  reactions:z.tuple([z.string().min(5).max(150),z.string().min(5).max(150)]),
  precedentReference:z.string().max(180),
});
export type GeneratedCrisis=z.infer<typeof generatedCrisisSchema>;
