"use client";

import { useTranslations } from "next-intl";
import type { SourceStatus } from "@repo/schemas";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { EmptyState, ErrorState } from "@/components/states";
import { useSourceStatusHistoryQuery } from "@/lib/query/sources";
import { useFormatters } from "@/lib/utils/format";

const BAR_CLASS: Record<SourceStatus, string> = {
  operational: "bg-success/70",
  degraded: "bg-warning",
  down: "bg-error",
};

/** Last 24 hours as 24 mini bars, each with an accessible tooltip. */
export function StatusHistory({ sourceId }: { sourceId: string }) {
  const t = useTranslations("sourceDetail");
  const tStatus = useTranslations("sourceMeta.status");
  const f = useFormatters();
  const query = useSourceStatusHistoryQuery(sourceId);

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} compact />;
  }
  if (query.isPending) {
    return <Skeleton className="h-10 w-full" />;
  }
  if (query.data.length === 0) {
    return (
      <EmptyState title={t("emptyStatus")} compact>
        <Button variant="secondary" size="sm" disabled={query.isFetching} onClick={() => query.refetch()}>
          {t("refreshStatus")}
        </Button>
      </EmptyState>
    );
  }

  const lastPoint = query.data.at(-1);

  return (
    <div className="grid gap-2">
      <ol className="flex h-10 items-end gap-[3px]" aria-label={t("statusHistory")}>
        {query.data.map((point) => {
          const label = t("hourLabel", {
            time: f.time(point.timestamp),
            status: tStatus(point.status),
            latency: f.number(point.avgLatencyMs),
          });
          return (
            <li key={point.timestamp} className="flex h-full flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label={label}
                    className={cn(
                      "h-full w-full rounded-sm focus-visible:outline-2 focus-visible:outline-accent",
                      BAR_CLASS[point.status],
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            </li>
          );
        })}
      </ol>
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{query.data[0] ? f.time(query.data[0].timestamp) : null}</span>
        <span>{t("statusHistoryHint")}</span>
        <span>{lastPoint ? f.time(lastPoint.timestamp) : null}</span>
      </div>
    </div>
  );
}
