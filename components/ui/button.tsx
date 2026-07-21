import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] px-5 py-3 text-[var(--accent-foreground)] shadow-[0_10px_30px_rgba(7,18,38,0.18)] hover:translate-y-[-1px]",
        secondary:
          "bg-[var(--surface-strong)] px-5 py-3 text-[var(--foreground)] hover:bg-[var(--surface-hover)]",
        outline:
          "border border-[var(--border)] bg-transparent px-5 py-3 text-[var(--foreground)] hover:bg-[var(--surface)]",
        ghost: "px-3 py-2 text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...props },
  ref,
) {
  return <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
});

export { Button, buttonVariants };