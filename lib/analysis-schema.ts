import { z } from "zod";

export const coverageSchema = z.enum(["Fully", "Partially", "Not Addressed"]);

export const criterionSchema = z.object({
  id: z.string().min(1),
  criterion: z.string().min(1),
  coverage: coverageSchema,
  reason: z.string().min(1),
  evidence: z.string().default(""),
  confidence: z.number().min(0).max(100),
  reviewerNote: z.string().min(1),
}).strict();

export const analysisResultSchema = z.object({
  criteria: z.array(criterionSchema).min(1),
  gaps: z.array(z.string()),
  uncertainties: z.array(z.string()),
  recommendations: z.array(z.string()),
}).strict();

export const analyzeRequestSchema = z.object({
  unitText: z.string().trim().min(20, "Unit of Competency text is too short."),
  assessmentText: z.string().trim().min(20, "Assessment Tool text is too short."),
});

export type AnalysisResultSchema = z.infer<typeof analysisResultSchema>;
export type AnalyzeRequestSchema = z.infer<typeof analyzeRequestSchema>;