"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { Plan } from "@repo/schemas";
import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useFormatters } from "@/lib/utils/format";

export function PlanPrice({ plan, className }: { plan: Plan; className?: string }) {
  const t = useTranslations("plans");
  const f = useFormatters();
  if (plan.priceMonthlyThb === null) {
    return <span className={cn("text-2xl font-semibold", className)}>{t("custom")}</span>;
  }
  if (plan.priceMonthlyThb === 0) {
    return <span className={cn("text-2xl font-semibold tabular-nums", className)}>{t("free")}</span>;
  }
  return (
    <span className={cn("text-2xl font-semibold tabular-nums", className)}>
      {f.currency(plan.priceMonthlyThb)}
      <span className="text-sm font-normal text-muted-foreground">{t("perMonth")}</span>
    </span>
  );
}

export function usePlanLimits() {
  const t = useTranslations("plans");
  const f = useFormatters();
  return {
    calls: (plan: Plan) => (plan.callsPerMonth === null ? t("custom") : t("calls", { count: f.number(plan.callsPerMonth) })),
    rateLimit: (plan: Plan) =>
      plan.rateLimitPerMinute === null ? t("custom") : t("rateLimit", { count: f.number(plan.rateLimitPerMinute) }),
    seats: (plan: Plan) => (plan.teamSeats === null ? t("custom") : t("seats", { count: plan.teamSeats })),
    retention: (plan: Plan) => t("retention", { days: plan.logRetentionDays }),
  };
}

interface PlanCardProps {
  plan: Plan;
  current?: boolean;
  /** Feature bullets to show (defaults to all of the plan's features). */
  maxFeatures?: number;
  action?: ReactNode;
}

export function PlanCard({ plan, current = false, maxFeatures, action }: PlanCardProps) {
  const t = useTranslations("plans");
  const tRows = useTranslations("pricing.rows");
  const limits = usePlanLimits();
  const features = maxFeatures ? plan.features.slice(-maxFeatures) : plan.features;

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-4 rounded-lg border bg-card p-5",
        current || plan.recommended ? "border-accent" : "border-border",
      )}
      aria-current={current ? "true" : undefined}
    >
      <header className="grid gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold">{t(`name.${plan.id}`)}</h3>
          {current ? <Badge tone="accent">{t("current")}</Badge> : null}
          {!current && plan.recommended ? <Badge tone="outline">{t("recommended")}</Badge> : null}
        </div>
        <PlanPrice plan={plan} />
        <p className="text-sm text-muted-foreground">{t(`summary.${plan.id}`)}</p>
      </header>
      <dl className="grid gap-1 border-y border-border py-3 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="sr-only">{tRows("calls")}</dt>
          <dd className="tabular-nums">{limits.calls(plan)}</dd>
        </div>
        <div className="flex justify-between gap-2 text-muted-foreground">
          <dt className="sr-only">{tRows("rateLimit")}</dt>
          <dd className="tabular-nums">{limits.rateLimit(plan)}</dd>
        </div>
      </dl>
      <ul className="grid flex-1 content-start gap-2 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check className="mt-1 size-3.5 shrink-0 text-success" aria-hidden />
            <span>{t(`feature.${feature}`)}</span>
          </li>
        ))}
      </ul>
      {action ? <div className="pt-1">{action}</div> : null}
    </article>
  );
}

export function PlanCardSkeleton() {
  return (
    <div className="grid gap-4 rounded-lg border border-border bg-card p-5" aria-hidden>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
