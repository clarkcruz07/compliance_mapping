import type { AnalysisResult } from "@/types/analysis";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisSummaryProps {
  result: AnalysisResult;
}

function averageConfidence(result: AnalysisResult) {
  if (result.criteria.length === 0) {
    return 0;
  }

  return Math.round(
    result.criteria.reduce((sum, criterion) => sum + criterion.confidence, 0) / result.criteria.length,
  );
}

export function AnalysisSummary({ result }: AnalysisSummaryProps) {
  const fully = result.criteria.filter((criterion) => criterion.coverage === "Fully").length;
  const partially = result.criteria.filter((criterion) => criterion.coverage === "Partially").length;
  const notAddressed = result.criteria.filter((criterion) => criterion.coverage === "Not Addressed").length;
  const reviewFlags = result.criteria.filter(
    (criterion) => criterion.confidence < 70 || criterion.evidence.trim().length === 0,
  ).length;

  const cards = [
    { label: "Fully addressed", value: fully, badge: "success" as const },
    { label: "Partially addressed", value: partially, badge: "warning" as const },
    { label: "Not addressed", value: notAddressed, badge: "danger" as const },
    { label: "Avg. confidence", value: `${averageConfidence(result)}%`, badge: "info" as const },
    { label: "Needs review", value: reviewFlags, badge: "warning" as const },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">{card.label}</CardTitle>
              <Badge variant={card.badge}>{card.label}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--foreground)]">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}