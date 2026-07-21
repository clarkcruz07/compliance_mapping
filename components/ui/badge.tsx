import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      neutral: "bg-[var(--surface-strong)] text-[var(--foreground)]",
      success: "bg-[color:var(--success-soft)] text-[color:var(--success)]",
      warning: "bg-[color:var(--warning-soft)] text-[color:var(--warning)]",
      danger: "bg-[color:var(--danger-soft)] text-[color:var(--danger)]",
      info: "bg-[color:var(--accent-soft)] text-[color:var(--accent)]",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };