import mammoth from "mammoth";

import type { ParsedDocument } from "@/types/document";

const TXT_TYPES = new Set(["text/plain", "text/markdown", "application/json"]);

function normalizeText(text: string) {
  return text.replace(/\u0000/g, "").replace(/\s{3,}/g, "\n\n").trim();
}

async function parsePdf(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();

    if (text) {
      pages.push(text);
    }
  }

  return pages.join("\n\n");
}

async function parseDocx(file: File) {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

async function parseTxt(file: File) {
  return file.text();
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  let text = "";

  if (file.type === "application/pdf" || extension === "pdf") {
    text = await parsePdf(file);
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  ) {
    text = await parseDocx(file);
  } else if (TXT_TYPES.has(file.type) || extension === "txt") {
    text = await parseTxt(file);
  } else {
    throw new Error("Unsupported file type. Upload a PDF, DOCX, or TXT file.");
  }

  const normalized = normalizeText(text);

  if (!normalized) {
    throw new Error("No readable text was found in this file.");
  }

  return {
    fileName: file.name,
    mimeType: file.type || extension || "unknown",
    size: file.size,
    text: normalized,
    source: "upload",
  };
}