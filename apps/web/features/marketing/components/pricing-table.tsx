"use client";

import { useTranslations } from "next-intl";
import { Check, Minus } from "lucide-react";
import { PlanFeatureSchema, type Plan, type PlanFeature } from "@repo/schemas";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { PlanCard, PlanPrice, usePlanLimits } from "@/components/domain/plan-card";
import { ErrorState } from "@/components/states";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { usePlansQuery } from "@/lib/query/usage";

const FEATURES: readonly PlanFeature[] = PlanFeatureSchema.options;

function PlanCta({ plan }: { plan: Plan }) {
  const t = useTranslations("pricing.cta");
  const variant = plan.recommended ? "primary" : "secondary";
  if (plan.id === "enterprise") {
    return (
      <a href={siteConfig.links.contactSales} className={cn(buttonVariants({ variant }), "w-full")}>
        {t(plan.id)}
      </a>
    );
  }
  return (
    <Link href="/login" className={cn(buttonVariants({ variant }), "w-full")}>
      {t(plan.id)}
    </Link>
  );
}

export function PricingTable() {
  const t = useTranslations("pricing");
  const tPlans = useTranslations("plans");
  const limits = usePlanLimits();
  const query = usePlansQuery();

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} />;
  }
  if (query.isPending) {
    return <Skeleton className="h-[640px] w-full rounded-lg" />;
  }

  const plans = query.data;
  const limitRows: { key: "calls" | "rateLimit" | "seats" | "retention" | "support"; render: (plan: Plan) => string }[] = [
    { key: "calls", render: limits.calls },
    { key: "rateLimit", render: limits.rateLimit },
    { key: "seats", render: limits.seats },
    { key: "retention", render: limits.retention },
    { key: "support", render: (plan) => tPlans(`support.${plan.support}`) },
  ];

  return (
    <>
      {/* Mobile: stacked plan cards */}
      <div className="grid gap-4 md:hidden">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} action={<PlanCta plan={plan} />} />
        ))}
      </div>

      {/* Tablet and up: plain comparison table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card md:block">
        <table className="w-full min-w-[720px] text-sm">
          <caption className="sr-only">{t("compareTitle")}</caption>
          <thead>
            <tr className="border-b border-border align-top">
              <th scope="col" className="w-1/4 px-4 py-4 text-left text-xs font-medium text-muted-foreground">
                {t("feature")}
              </th>
              {plans.map((plan) => (
                <th key={plan.id} scope="col" className="px-4 py-4 text-left font-normal">
                  <div className="grid gap-2">
                    <span className="text-base font-semibold">{tPlans(`name.${plan.id}`)}</span>
                    <PlanPrice plan={plan} className="text-xl" />
                    <PlanCta plan={plan} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {limitRows.map((row) => (
              <tr key={row.key} className="border-b border-border hover:bg-subtle">
                <th scope="row" className="px-4 py-3 text-left font-medium">
                  {t(`rows.${row.key}`)}
                </th>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-3 tabular-nums">
                    {row.render(plan)}
                  </td>
                ))}
              </tr>
            ))}
            {FEATURES.map((feature) => (
              <tr key={feature} className="border-b border-border last:border-0 hover:bg-subtle">
                <th scope="row" className="px-4 py-3 text-left font-medium">
                  {tPlans(`feature.${feature}`)}
                </th>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-3">
                    {plan.features.includes(feature) ? (
                      <>
                        <Check className="size-4 text-success" aria-hidden />
                        <span className="sr-only">{t("included")}</span>
                      </>
                    ) : (
                      <>
                        <Minus className="size-4 text-border-strong" aria-hidden />
                        <span className="sr-only">{t("notIncluded")}</span>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
