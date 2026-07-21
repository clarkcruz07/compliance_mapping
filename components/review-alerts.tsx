import type { AnalysisResult } from "@/types/analysis";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewAlertsProps {
  result: AnalysisResult;
}

export function ReviewAlerts({ result }: ReviewAlertsProps) {
  const lowConfidence = result.criteria.filter((criterion) => criterion.confidence < 70);
  const missingEvidence = result.criteria.filter((criterion) => !criterion.evidence.trim());

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Human Review Alerts</CardTitle>
            <CardDescription>Low-confidence findings and missing evidence should be reviewed by a consultant before decisions are made.</CardDescription>
          </div>
          <Badge variant={lowConfidence.length || missingEvidence.length ? "warning" : "success"}>
            {lowConfidence.length || missingEvidence.length ? "Human Review Recommended" : "No immediate review flags"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Confidence below 70</p>
          <div className="mt-4 space-y-3">
            {lowConfidence.length ? (
              lowConfidence.map((criterion) => (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4" key={criterion.id}>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{criterion.id} · {criterion.criterion}</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">⚠ Human Review Recommended</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">No low-confidence criteria in this run.</p>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Evidence gaps</p>
          <div className="mt-4 space-y-3">
            {missingEvidence.length ? (
              missingEvidence.map((criterion) => (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4" key={criterion.id}>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{criterion.id} · {criterion.criterion}</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">No supporting evidence found.</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">Every criterion includes some supporting evidence.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}