"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "../lib/utils";

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  value: number;
  tone?: "accent" | "warning" | "error";
}

const INDICATOR: Record<NonNullable<ProgressProps["tone"]>, string> = {
  accent: "bg-accent",
  warning: "bg-warning",
  error: "bg-error",
};

export function Progress({ className, value, tone = "accent", ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <ProgressPrimitive.Root
      value={clamped}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-hover", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full rounded-full transition-[width]", INDICATOR[tone])}
        style={{ width: `${clamped}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
