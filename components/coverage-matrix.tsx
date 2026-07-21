import type { AnalysisResult, CriterionAnalysis, CoverageStatus } from "@/types/analysis";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { clamp, formatConfidence, formatCoverageStatus } from "@/lib/utils";

function coverageVariant(status: CoverageStatus) {
  if (status === "Fully") {
    return "success" as const;
  }

  if (status === "Partially") {
    return "warning" as const;
  }

  return "danger" as const;
}

function confidenceIndicator(criterion: CriterionAnalysis) {
  if (criterion.confidence >= 85) {
    return "bg-[var(--success)]";
  }

  if (criterion.confidence >= 70) {
    return "bg-[var(--warning)]";
  }

  return "bg-[var(--danger)]";
}

interface CoverageMatrixProps {
  result: AnalysisResult;
}

export function CoverageMatrix({ result }: CoverageMatrixProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coverage Matrix</CardTitle>
        <CardDescription>Each Performance Criterion is evaluated independently against the uploaded assessment evidence.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="hidden grid-cols-[88px_minmax(0,1.55fr)_140px_160px_minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)] lg:grid">
          <span>ID</span>
          <span>Performance Criterion</span>
          <span>Coverage</span>
          <span>Confidence</span>
          <span>Reason</span>
          <span>Evidence</span>
          <span>Reviewer Note</span>
        </div>

        {result.criteria.map((criterion) => (
          <div
            className="grid gap-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 lg:grid-cols-[88px_minmax(0,1.55fr)_140px_160px_minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-start"
            key={criterion.id}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)] lg:hidden">ID</p>
              <p className="font-mono text-sm text-[var(--foreground)]">{criterion.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)] lg:hidden">Performance Criterion</p>
              <p className="text-sm leading-7 text-[var(--foreground)]">{criterion.criterion}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)] lg:hidden">Coverage</p>
              <Badge variant={coverageVariant(criterion.coverage)}>{formatCoverageStatus(criterion.coverage)}</Badge>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)] lg:hidden">Confidence</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-[var(--foreground)]">
                  <span>{formatConfidence(criterion.confidence)}</span>
                  {criterion.confidence < 70 ? <Badge variant="warning">Human review</Badge> : null}
                </div>
                <Progress value={clamp(criterion.confidence)} indicatorClassName={confidenceIndicator(criterion)} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)] lg:hidden">Reason</p>
              <p className="text-sm leading-7 text-[var(--foreground)]">{criterion.reason}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)] lg:hidden">Evidence</p>
              <p className="text-sm leading-7 text-[var(--foreground)]/80">
                {criterion.evidence || "No supporting evidence found."}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)] lg:hidden">Reviewer Note</p>
              <p className="text-sm leading-7 text-[var(--foreground)]/80">{criterion.reviewerNote}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}