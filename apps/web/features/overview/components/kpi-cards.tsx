"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { UsageStat } from "@repo/schemas";
import { Card } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useFormatters } from "@/lib/utils/format";

function Kpi({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <Card className="grid gap-1 p-4 md:p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums md:text-[28px]">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground tabular-nums">{hint}</p> : null}
    </Card>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-busy>
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i} className="grid gap-2 p-4 md:p-5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-28" />
        </Card>
      ))}
    </div>
  );
}

export function KpiCards({ usage, totalSources }: { usage: UsageStat; totalSources: number | undefined }) {
  const t = useTranslations("overview.kpi");
  const tCommon = useTranslations("common");
  const f = useFormatters();
  const change = usage.previousPeriodCalls > 0 ? usage.totalCalls / usage.previousPeriodCalls - 1 : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Kpi label={t("calls")} value={f.number(usage.totalCalls)} hint={t("vsPrevious", { change: f.signedPercent(change) })} />
      <Kpi label={t("successRate")} value={f.percent(usage.successRate)} hint={t("last30Days")} />
      <Kpi label={t("latency")} value={tCommon("milliseconds", { value: f.number(usage.avgLatencyMs) })} hint={t("last30Days")} />
      <Kpi
        label={t("activeSources")}
        value={f.number(usage.activeSources)}
        hint={totalSources !== undefined ? t("ofTotal", { total: totalSources }) : undefined}
      />
    </div>
  );
}
