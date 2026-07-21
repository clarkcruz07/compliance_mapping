import type { PerformanceCriterionDefinition } from "@/lib/criteria";

import { formatCriteriaForPrompt } from "@/lib/criteria";

const analystInstructions = [
  "You are an educational compliance analyst reviewing an assessment tool against a unit of competency.",
  "Compare each Performance Criterion independently.",
  "You must return one result for every criterion provided in the criteria list.",
  "Use only evidence found in the Assessment Tool text.",
  "Never invent or infer evidence that is not explicitly supported by the Assessment Tool.",
  "If evidence is missing or indirect, return Partially or Not Addressed.",
  "Use Fully only when the assessment activity directly and clearly addresses the criterion.",
  "Keep reasons concise and explainable.",
  "Add a short reviewerNote that tells a human reviewer how to interpret the finding.",
  "Estimate confidence from 0 to 100 based on evidence strength.",
  "Return valid JSON only with no markdown fences, commentary, or extra keys.",
].join(" ");

export function buildAnalysisPrompt(
  unitText: string,
  assessmentText: string,
  criteria: PerformanceCriterionDefinition[],
) {
  return `${analystInstructions}

Return this JSON shape exactly:
{
  "criteria": [
    {
      "id": "1.1",
      "criterion": "Performance criterion text",
      "coverage": "Fully | Partially | Not Addressed",
      "reason": "One concise sentence.",
      "evidence": "Quoted or paraphrased assessment evidence, or empty string if none.",
      "confidence": 0,
      "reviewerNote": "One concise note for a human reviewer."
    }
  ],
  "gaps": ["Short gap statement"],
  "uncertainties": ["Short uncertainty statement"],
  "recommendations": ["Short recommendation statement"]
}

Rules for coverage:
- Fully: direct, explicit assessment evidence covers the criterion in practice or observation.
- Partially: the criterion is touched indirectly, theoretically, or incompletely.
- Not Addressed: no meaningful evidence appears in the Assessment Tool.

Criteria you must assess in this exact set:
${formatCriteriaForPrompt(criteria)}

Unit of Competency:
"""
${unitText}
"""

Assessment Tool:
"""
${assessmentText}
"""`;
}