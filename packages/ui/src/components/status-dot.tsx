import * as React from "react";
import { cn } from "../lib/utils";

export type StatusTone = "success" | "warning" | "error" | "neutral" | "accent";

const DOT_CLASS: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  neutral: "bg-border-strong",
  accent: "bg-accent",
};

interface StatusDotProps extends React.ComponentProps<"span"> {
  tone: StatusTone;
  /** Visible label — status is never conveyed by colour alone. */
  label: React.ReactNode;
}

export function StatusDot({ tone, label, className, ...props }: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-foreground", className)} {...props}>
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT_CLASS[tone])} />
      <span>{label}</span>
    </span>
  );
}
