import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/utils";

interface MarketingSectionProps {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  subtle?: boolean;
}

/** Left-aligned section scaffold for public pages. */
export function MarketingSection({ id, title, description, actions, children, className, subtle }: MarketingSectionProps) {
  return (
    <section id={id} className={cn("border-b border-border", subtle && "bg-subtle", className)}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid max-w-2xl gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {description ? <p className="text-muted-foreground">{description}</p> : null}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </section>
  );
}
