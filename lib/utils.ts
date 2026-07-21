import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { CoverageStatus } from "@/types/analysis";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatConfidence(value: number) {
  return `${Math.round(value)}%`;
}

export function formatCoverageStatus(status: CoverageStatus) {
  if (status === "Fully") {
    return "Fully Addressed";
  }

  if (status === "Partially") {
    return "Partially Addressed";
  }

  return "Not Addressed";
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}