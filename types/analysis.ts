export type CoverageStatus = "Fully" | "Partially" | "Not Addressed";

export interface CriterionAnalysis {
  id: string;
  criterion: string;
  coverage: CoverageStatus;
  reason: string;
  evidence: string;
  confidence: number;
  reviewerNote: string;
}

export interface AnalysisResult {
  criteria: CriterionAnalysis[];
  gaps: string[];
  uncertainties: string[];
  recommendations: string[];
}

export interface AnalyzeRequest {
  unitText: string;
  assessmentText: string;
}