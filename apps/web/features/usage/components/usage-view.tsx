"use client";

import { useTranslations } from "next-intl";
import { QUOTA_WARNING_RATIO, planRank, type Plan } from "@repo/schemas";
import { Button } from "@repo/ui/components/button";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { toast } from "@repo/ui/components/toaster";
import { cn } from "@repo/ui/lib/utils";
import { PlanCard, PlanCardSkeleton } from "@/components/domain/plan-card";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { ErrorState } from "@/components/states";
import { siteConfig } from "@/config/site";
import { useSourcesQuery } from "@/lib/query/sources";
import { usePlansQuery, useUsageSummaryQuery } from "@/lib/query/usage";
import { useWorkspaceQuery } from "@/lib/query/workspace";
import { useFormatters, useLocalized } from "@/lib/utils/format";
import { CallsBySourceChart } from "./usage-charts";
import { QuotaCard } from "./quota-card";
import { InvoiceList } from "./invoice-list";
import { UsageEmptyState } from "./usage-empty-state";

function PlanAction({ plan, currentPlan }: { plan: Plan; currentPlan: Plan | undefined }) {
  const t = useTranslations("usage.plans");
  const tPlans = useTranslations("plans.name");
  if (!currentPlan) return null;
  if (plan.id === currentPlan.id) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        {t("current")}
      </Button>
    );
  }
  if (plan.id === "enterprise") {
    return (
      <a href={siteConfig.links.contactSales} className={cn(buttonVariants({ variant: "secondary" }), "w-full")}>
        {t("contact")}
      </a>
    );
  }
  const upgrade = planRank(plan.id) > planRank(currentPlan.id);
  return (
    <Button
      variant="secondary"
      className="w-full"
      onClick={() => toast.success(t("requested", { plan: tPlans(plan.id) }))}
    >
      {upgrade ? t("upgrade", { plan: tPlans(plan.id) }) : t("change", { plan: tPlans(plan.id) })}
    </Button>
  );
}

export function UsageView() {
  const t = useTranslations("usage");
  const tPlans = useTranslations("plans.name");
  const f = useFormatters();
  const localized = useLocalized();
  const usage = useUsageSummaryQuery();
  const plans = usePlansQuery();
  const workspace = useWorkspaceQuery();
  const sources = useSourcesQuery();

  const currentPlan = plans.data?.find((plan) => plan.id === workspace.data?.planId);
  const nearQuota = usage.data ? usage.data.quotaUsed / usage.data.quotaLimit >= QUOTA_WARNING_RATIO : false;
  const sourceName = (id: string) => {
    const source = sources.data?.find((s) => s.id === id);
    return source ? localized(source.name) : id;
  };

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <div className={cn("grid gap-4", nearQuota && "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]")}>
        <QuotaCard usage={usage.data} isPending={usage.isPending} error={usage.error} onRetry={() => usage.refetch()} showUpgrade={false} />
        {nearQuota ? (
          <Card className="border-accent">
            <CardHeader>
              <div className="grid gap-1">
                <CardTitle>{t("upgradeCta.title")}</CardTitle>
                <CardDescription>{t("upgradeCta.description")}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <a href={siteConfig.links.contactSales} className={buttonVariants({ variant: "primary" })}>
                {t("upgradeCta.action")}
              </a>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("bySource.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          {usage.isError || sources.isError ? (
            <ErrorState
              error={usage.error ?? sources.error}
              onRetry={() => { void usage.refetch(); void sources.refetch(); }}
              retrying={usage.isFetching || sources.isFetching}
              compact
              className="lg:col-span-2"
            />
          ) : usage.isPending || sources.isPending ? (
            <>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </>
          ) : usage.data.bySource.every((row) => row.calls === 0) ? (
            <div className="lg:col-span-2"><UsageEmptyState /></div>
          ) : (
            <>
              <CallsBySourceChart data={usage.data.bySource} sources={sources.data} />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th scope="col" className="py-2 pr-4 font-medium">{t("bySource.source")}</th>
                    <th scope="col" className="py-2 pr-4 text-right font-medium">{t("bySource.calls")}</th>
                    <th scope="col" className="py-2 text-right font-medium">{t("bySource.share")}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...usage.data.bySource]
                    .sort((a, b) => b.calls - a.calls)
                    .map((row) => (
                      <tr key={row.sourceId} className="border-b border-border last:border-0 hover:bg-subtle">
                        <td className="py-2.5 pr-4">{sourceName(row.sourceId)}</td>
                        <td className="py-2.5 pr-4 text-right tabular-nums">{f.number(row.calls)}</td>
                        <td className="py-2.5 text-right text-muted-foreground tabular-nums">
                          {f.percent(row.calls / Math.max(1, usage.data.totalCalls))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4">
        <SectionHeading
          title={t("plans.title")}
          description={currentPlan ? `${t("plans.current")}: ${tPlans(currentPlan.id)}` : undefined}
        />
        {plans.isError || workspace.isError ? (
          <ErrorState
            error={plans.error ?? workspace.error}
            onRetry={() => { void plans.refetch(); void workspace.refetch(); }}
            retrying={plans.isFetching || workspace.isFetching}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {plans.isPending || workspace.isPending
              ? Array.from({ length: 4 }, (_, i) => <PlanCardSkeleton key={i} />)
              : plans.data.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    current={plan.id === currentPlan?.id}
                    maxFeatures={4}
                    action={<PlanAction plan={plan} currentPlan={currentPlan} />}
                  />
                ))}
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <SectionHeading title={t("invoices.title")} />
        <InvoiceList />
      </section>
    </>
  );
}
