import * as React from "react";
import { cn } from "../lib/utils";

interface StatePanelProps {
  tone?: "neutral" | "error";
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Concrete next action(s): buttons, copyable snippets. */
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

/**
 * Shared layout for empty and error states. Left-aligned, text-first, no illustrations.
 * Apps wrap this with translated copy (EmptyState / ErrorState).
 */
export function StatePanel({ tone = "neutral", icon, title, description, children, className, compact }: StatePanelProps) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-dashed",
        compact ? "p-4" : "p-6 md:p-8",
        tone === "error" ? "border-error/30 bg-error-subtle/40" : "border-border-strong bg-subtle/60",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <span
            className={cn(
              "mt-0.5 shrink-0 [&_svg]:size-4",
              tone === "error" ? "text-error-text" : "text-muted-foreground",
            )}
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
        <div className="grid max-w-prose gap-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
        </div>
      </div>
      {children ? <div className={cn("flex flex-wrap items-center gap-2", icon && "md:pl-7")}>{children}</div> : null}
    </div>
  );
}
