"use client";

import { Download, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

import type { AnalysisResult } from "@/types/analysis";
import type { ParsedDocument } from "@/types/document";
import type { UploadState } from "@/types/document";

import { AnalysisSummary } from "@/components/analysis-summary";
import { CoverageMatrix } from "@/components/coverage-matrix";
import { FileUploadCard } from "@/components/file-upload-card";
import { InsightList } from "@/components/insight-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ReviewAlerts } from "@/components/review-alerts";
import { SAMPLE_ASSESSMENT_TEXT, SAMPLE_UNIT_TEXT } from "@/lib/sample-documents";
import { exportAnalysisCsv, exportAnalysisJson } from "@/utils/export";
import { parseDocument } from "@/utils/document-parser";

type Stage = "idle" | "parsing-unit" | "parsing-assessment" | "analyzing" | "done";

const initialUploadState: UploadState = {
  status: "idle",
  document: null,
  error: null,
};

function createSampleDocument(fileName: string, text: string): ParsedDocument {
  return {
    fileName,
    mimeType: "text/plain",
    size: text.length,
    text,
    source: "sample",
  };
}

const stageMeta: Record<Stage, { label: string; progress: number }> = {
  idle: { label: "Waiting for documents", progress: 0 },
  "parsing-unit": { label: "Extracting Unit of Competency", progress: 20 },
  "parsing-assessment": { label: "Extracting Assessment Tool", progress: 45 },
  analyzing: { label: "Comparing performance criteria against assessment evidence", progress: 78 },
  done: { label: "Analysis complete", progress: 100 },
};

function isAnalysisResult(payload: AnalysisResult | { error?: string }): payload is AnalysisResult {
  return "criteria" in payload && "gaps" in payload && "uncertainties" in payload && "recommendations" in payload;
}

export function ComplianceDashboard() {
  const [unitUpload, setUnitUpload] = useState<UploadState>(initialUploadState);
  const [assessmentUpload, setAssessmentUpload] = useState<UploadState>(initialUploadState);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  function loadSampleData() {
    setError(null);
    setResult(null);
    setStage("idle");
    setUnitUpload({
      status: "ready",
      document: createSampleDocument("sample-unit.txt", SAMPLE_UNIT_TEXT),
      error: null,
    });
    setAssessmentUpload({
      status: "ready",
      document: createSampleDocument("sample-assessment.txt", SAMPLE_ASSESSMENT_TEXT),
      error: null,
    });
  }

  async function handleFileSelect(kind: "unit" | "assessment", file: File) {
    const setState = kind === "unit" ? setUnitUpload : setAssessmentUpload;

    setError(null);
    setResult(null);
    setStage(kind === "unit" ? "parsing-unit" : "parsing-assessment");
    setState({ status: "parsing", document: null, error: null });

    try {
      const parsed = await parseDocument(file);
      setState({ status: "ready", document: parsed, error: null });
      setStage("idle");
    } catch (cause) {
      setState({
        status: "error",
        document: null,
        error: cause instanceof Error ? cause.message : "We could not read that file.",
      });
      setStage("idle");
    }
  }

  async function handleAnalyze() {
    if (!unitUpload.document || !assessmentUpload.document) {
      return;
    }

    setStage("analyzing");
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unitText: unitUpload.document.text,
          assessmentText: assessmentUpload.document.text,
        }),
      });

      const payload = (await response.json()) as AnalysisResult | { error?: string };

      if (!response.ok) {
        const message = "error" in payload ? payload.error : undefined;
        throw new Error(message || "The analysis could not be completed.");
      }

      if (!isAnalysisResult(payload)) {
        throw new Error(payload.error || "The analysis could not be completed.");
      }

      setResult(payload);
      setStage("done");
    } catch (cause) {
      setStage("idle");
      setError(cause instanceof Error ? cause.message : "The analysis could not be completed.");
    }
  }

  const canAnalyze = unitUpload.status === "ready" && assessmentUpload.status === "ready" && stage !== "analyzing";
  const activeMeta = stageMeta[stage];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header className="grid gap-6 rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1.35fr_0.85fr] lg:p-8">
        <div className="space-y-5">
          <Badge variant="info" className="w-fit">AI-assisted compliance mapping</Badge>
          <div className="space-y-3">
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-5xl">
              Map every Performance Criterion to evidence before a human signs it off.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--muted-foreground)] md:text-lg">
              Upload the Unit of Competency and Assessment Tool, extract text automatically, and generate an explainable coverage matrix with confidence scoring, explicit gaps, and review alerts.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="success">Reliable JSON output</Badge>
            <Badge variant="warning">Human-in-the-loop</Badge>
            <Badge variant="neutral">Next.js + Groq + Zod</Badge>
          </div>
        </div>

        <Card className="border-none bg-[var(--surface)] shadow-none">
          <CardContent className="space-y-5 p-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Review flow</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)]">{activeMeta.label}</p>
              </div>
              <ThemeToggle />
            </div>

            <Progress value={activeMeta.progress} className="h-3" />

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: "1", label: "Upload" },
                { title: "2", label: "Analyze" },
                { title: "3", label: "Review" },
              ].map((step, index) => {
                const complete = activeMeta.progress >= (index + 1) * 33;
                return (
                  <div className="rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-4" key={step.title}>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Step {step.title}</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{step.label}</p>
                    <div className="mt-3 h-1.5 rounded-full bg-[var(--surface-strong)]">
                      <div
                        className={complete ? "h-full rounded-full bg-[var(--accent)]" : "h-full rounded-full bg-transparent"}
                        style={{ width: complete ? "100%" : "0%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="min-w-44" disabled={!canAnalyze} onClick={handleAnalyze} type="button">
                {stage === "analyzing" ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Analyze Documents
              </Button>

              <Button disabled={stage === "analyzing"} onClick={loadSampleData} type="button" variant="secondary">
                Load Appendix A Sample
              </Button>

              <Button
                disabled={!result}
                onClick={() => result && exportAnalysisJson(result)}
                type="button"
                variant="outline"
              >
                <Download className="size-4" />
                Export JSON
              </Button>

              <Button
                disabled={!result}
                onClick={() => result && exportAnalysisCsv(result)}
                type="button"
                variant="outline"
              >
                <Download className="size-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <FileUploadCard
          description="Upload the source document that defines the Elements and Performance Criteria."
          disabled={stage === "analyzing"}
          onSelect={(file) => handleFileSelect("unit", file)}
          state={unitUpload}
          title="Unit of Competency"
        />
        <FileUploadCard
          description="Upload the assessment tasks, observation checklists, or question set to compare against the unit."
          disabled={stage === "analyzing"}
          onSelect={(file) => handleFileSelect("assessment", file)}
          state={assessmentUpload}
          title="Assessment Tool"
        />
      </section>

      {error ? (
        <Card className="border-[color:var(--danger-soft)] bg-[color:var(--danger-soft)]/60">
          <CardContent className="flex items-start gap-3 p-6 text-sm leading-7 text-[var(--foreground)]">
            <ShieldCheck className="mt-1 size-5 text-[var(--danger)]" />
            <div>
              <p className="font-semibold">Analysis issue</p>
              <p className="text-[var(--muted-foreground)]">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {result ? (
        <div className="space-y-6">
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="flex flex-col gap-3 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)]">
                  Decision support, not an autonomous compliance decision
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
                  Use the evidence, confidence, reviewer notes, and uncertainty list to guide consultant review. Low-confidence or evidence-light criteria should not be treated as final without human judgement.
                </p>
              </div>
              <Badge variant="warning" className="h-fit w-fit">Human review remains required</Badge>
            </CardContent>
          </Card>

          <AnalysisSummary result={result} />
          <CoverageMatrix result={result} />

          <section className="grid gap-6 xl:grid-cols-3">
            <InsightList
              description="Missing assessment evidence or omitted criteria surfaced by the model."
              items={result.gaps}
              title="Gap Analysis"
              tone="gap"
            />
            <InsightList
              description="Where the evidence is weak, indirect, or too theoretical to treat as certain."
              items={result.uncertainties}
              title="Uncertainties"
              tone="uncertainty"
            />
            <InsightList
              description="Suggested actions to make the assessment tool more defensible and complete."
              items={result.recommendations}
              title="Recommendations"
              tone="recommendation"
            />
          </section>

          <ReviewAlerts result={result} />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-[var(--surface-strong)] text-[var(--accent)]">
              <Sparkles className="size-7" />
            </div>
            <div className="space-y-2">
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)]">No analysis yet</p>
              <p className="max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
                Upload both documents to generate the coverage matrix, gap analysis, recommendations, and human review alerts.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}