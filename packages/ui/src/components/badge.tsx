import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "border-border bg-subtle text-foreground",
        accent: "border-accent/20 bg-accent-subtle text-accent",
        success: "border-success/25 bg-success-subtle text-success-text",
        warning: "border-warning/40 bg-warning-subtle text-warning-text",
        error: "border-error/25 bg-error-subtle text-error-text",
        outline: "border-border-strong bg-background text-muted-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone }), className)} {...props} />;
}
