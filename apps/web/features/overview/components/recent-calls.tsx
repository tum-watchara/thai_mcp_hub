"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { CallStatusLabel, ClientLabel, ToolName } from "@/components/domain/badges";
import { ErrorState } from "@/components/states";
import { Link } from "@/i18n/navigation";
import { useLogsQuery } from "@/lib/query/logs";
import { useFormatters } from "@/lib/utils/format";
import { LogsEmptyState } from "@/features/logs/components/logs-empty-state";

const RECENT_PARAMS = { page: 1, pageSize: 5, sortBy: "timestamp", sortDir: "desc" } as const;

export function RecentCalls() {
  const t = useTranslations("overview.recent");
  const tCommon = useTranslations("common");
  const f = useFormatters();
  const query = useLogsQuery(RECENT_PARAMS);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <Link href="/dashboard/logs" className="inline-flex min-h-10 items-center gap-1 text-sm text-accent hover:underline md:min-h-0">
          {t("viewAll")}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </CardHeader>
      <CardContent className="pt-2 md:pt-3">
        {query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} compact />
        ) : query.isPending ? (
          <div className="grid gap-3" aria-busy>
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : query.data.items.length === 0 ? (
          <LogsEmptyState compact />
        ) : (
          <ul className="divide-y divide-border">
            {query.data.items.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                <ToolName name={log.tool} className="min-w-0 flex-1 truncate" />
                <span className="text-xs text-muted-foreground">
                  <ClientLabel client={log.client} />
                </span>
                <span className="w-28">
                  <CallStatusLabel status={log.status} />
                </span>
                <span className="w-16 text-right text-xs text-muted-foreground tabular-nums">
                  {tCommon("milliseconds", { value: log.latencyMs })}
                </span>
                <span className="w-24 text-right text-xs text-muted-foreground">{f.relative(log.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
