"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { PageHeader } from "@/components/page-header";
import { ErrorState } from "@/components/states";
import { useSourcesQuery } from "@/lib/query/sources";
import { useUsageSummaryQuery } from "@/lib/query/usage";
import { CallsBySourceChart, CallsPerDayChart } from "@/features/usage/components/usage-charts";
import { QuotaCard } from "@/features/usage/components/quota-card";
import { UsageEmptyState } from "@/features/usage/components/usage-empty-state";
import { ConnectionCard } from "./connection-card";
import { KpiCards, KpiCardsSkeleton } from "./kpi-cards";
import { RecentCalls } from "./recent-calls";

export function OverviewView() {
  const t = useTranslations("overview");
  const usage = useUsageSummaryQuery();
  const sources = useSourcesQuery();

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ConnectionCard />
        <QuotaCard usage={usage.data} isPending={usage.isPending} error={usage.error} onRetry={() => usage.refetch()} />
      </div>

      {usage.isError ? (
        <ErrorState error={usage.error} onRetry={() => usage.refetch()} retrying={usage.isFetching} />
      ) : usage.isPending ? (
        <KpiCardsSkeleton />
      ) : (
        <KpiCards usage={usage.data} totalSources={sources.data?.length} />
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.callsPerDay")}</CardTitle>
          </CardHeader>
          <CardContent>
            {usage.isError ? (
              <ErrorState error={usage.error} onRetry={() => usage.refetch()} retrying={usage.isFetching} compact />
            ) : usage.isPending ? (
              <Skeleton className="h-64 w-full" />
            ) : usage.data.totalCalls === 0 ? (
              <UsageEmptyState />
            ) : (
              <CallsPerDayChart data={usage.data.daily} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.callsBySource")}</CardTitle>
          </CardHeader>
          <CardContent>
            {usage.isError || sources.isError ? (
              <ErrorState
                error={usage.error ?? sources.error}
                onRetry={() => { void usage.refetch(); void sources.refetch(); }}
                retrying={usage.isFetching || sources.isFetching}
                compact
              />
            ) : usage.isPending || sources.isPending ? (
              <Skeleton className="h-64 w-full" />
            ) : usage.data.bySource.every((row) => row.calls === 0) ? (
              <UsageEmptyState />
            ) : (
              <CallsBySourceChart data={usage.data.bySource} sources={sources.data} />
            )}
          </CardContent>
        </Card>
      </div>

      <RecentCalls />
    </>
  );
}
