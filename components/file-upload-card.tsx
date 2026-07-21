"use client";

import { FileText, LoaderCircle, UploadCloud } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import type { UploadState } from "@/types/document";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FileUploadCardProps {
  title: string;
  description: string;
  state: UploadState;
  disabled?: boolean;
  onSelect: (file: File) => void;
}

export function FileUploadCard({ title, description, state, disabled, onSelect }: FileUploadCardProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const [firstFile] = acceptedFiles;
      if (firstFile) {
        onSelect(firstFile);
      }
    },
    [onSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {state.status === "ready" ? <Badge variant="success">Ready</Badge> : null}
          {state.status === "error" ? <Badge variant="danger">Needs attention</Badge> : null}
          {state.status === "parsing" ? <Badge variant="warning">Parsing</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={[
            "group flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed px-6 py-8 text-center transition-colors",
            isDragActive ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface)]",
            disabled ? "cursor-not-allowed opacity-60" : "hover:border-[var(--accent)] hover:bg-[var(--surface-hover)]",
          ].join(" ")}
        >
          <input {...getInputProps()} />
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--surface-strong)] text-[var(--accent)]">
            {state.status === "parsing" ? <LoaderCircle className="size-6 animate-spin" /> : <UploadCloud className="size-6" />}
          </div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--foreground)]">
            {isDragActive ? "Drop the file here" : "Drag and drop or click to upload"}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">PDF, DOCX, and TXT supported.</p>

          {state.document ? (
            <div className="mt-6 flex w-full items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left">
              <div className="mt-1 rounded-xl bg-[var(--surface-strong)] p-2 text-[var(--accent)]">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">{state.document.fileName}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {state.document.source === "sample"
                    ? `Sample loaded · ${state.document.text.length.toLocaleString()} characters ready`
                    : `${(state.document.size / 1024).toFixed(1)} KB · ${state.document.text.length.toLocaleString()} characters extracted`}
                </p>
              </div>
            </div>
          ) : null}

          {state.error ? <p className="mt-4 text-sm text-[color:var(--danger)]">{state.error}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}