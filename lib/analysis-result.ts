import { analysisResultSchema } from "@/lib/analysis-schema";
import type { PerformanceCriterionDefinition } from "@/lib/criteria";

import type { AnalysisResult } from "@/types/analysis";

function extractJsonPayload(content: string) {
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("The model response did not contain valid JSON.");
  }

  return content.slice(firstBrace, lastBrace + 1);
}

export function parseModelResult(content: string) {
  return analysisResultSchema.parse(JSON.parse(extractJsonPayload(content)));
}

export function normalizeAnalysisResult(
  input: AnalysisResult,
  expectedCriteria: PerformanceCriterionDefinition[],
): AnalysisResult {
  const expectedById = new Map(expectedCriteria.map((criterion) => [criterion.id, criterion]));
  const actualById = new Map(input.criteria.map((criterion) => [criterion.id, criterion]));

  const normalizedCriteria = expectedCriteria.map((expectedCriterion) => {
    const match = actualById.get(expectedCriterion.id);

    if (!match) {
      throw new Error(`The analysis did not return criterion ${expectedCriterion.id}.`);
    }

    return {
      ...match,
      criterion: expectedCriterion.criterion,
      confidence: Math.round(match.confidence),
      evidence: match.evidence.trim(),
      reviewerNote: match.reviewerNote.trim(),
      reason: match.reason.trim(),
    };
  });

  const unexpectedCriteria = input.criteria.filter((criterion) => !expectedById.has(criterion.id));

  if (unexpectedCriteria.length > 0) {
    throw new Error(`The analysis returned unexpected criteria: ${unexpectedCriteria.map((item) => item.id).join(", ")}.`);
  }

  return {
    ...input,
    criteria: normalizedCriteria,
    gaps: input.gaps.map((item) => item.trim()).filter(Boolean),
    uncertainties: input.uncertainties.map((item) => item.trim()).filter(Boolean),
    recommendations: input.recommendations.map((item) => item.trim()).filter(Boolean),
  };
}