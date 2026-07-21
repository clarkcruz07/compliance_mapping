export interface ParsedDocument {
  fileName: string;
  mimeType: string;
  size: number;
  text: string;
  source: "upload" | "sample";
}

export interface UploadState {
  status: "idle" | "parsing" | "ready" | "error";
  document: ParsedDocument | null;
  error: string | null;
}