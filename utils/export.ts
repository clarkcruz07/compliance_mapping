import type { AnalysisResult } from "@/types/analysis";

import { formatCoverageStatus } from "@/lib/utils";

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string | number) {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

export function exportAnalysisJson(result: AnalysisResult) {
  const blob = new Blob([JSON.stringify(result, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  downloadBlob(blob, "compliance-analysis.json");
}

export function exportAnalysisCsv(result: AnalysisResult) {
  const rows = [
    ["ID", "Criterion", "Coverage", "Confidence", "Reason", "Evidence", "Reviewer Note"],
    ...result.criteria.map((criterion) => [
      criterion.id,
      criterion.criterion,
      formatCoverageStatus(criterion.coverage),
      criterion.confidence,
      criterion.reason,
      criterion.evidence || "No supporting evidence found.",
      criterion.reviewerNote,
    ]),
  ];

  const csv = rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, "compliance-analysis.csv");
}