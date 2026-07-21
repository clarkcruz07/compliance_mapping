import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({ value, className, indicatorClassName }: ProgressProps) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-strong)]", className)}>
      <div
        className={cn("h-full rounded-full bg-[var(--accent)] transition-[width] duration-500", indicatorClassName)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}