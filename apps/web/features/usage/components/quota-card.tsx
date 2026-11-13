"use client";

import { useTranslations } from "next-intl";
import { TriangleAlert } from "lucide-react";
import { QUOTA_WARNING_RATIO, type UsageStat } from "@repo/schemas";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { ErrorState } from "@/components/states";
import { Link } from "@/i18n/navigation";
import { useFormatters } from "@/lib/utils/format";

interface QuotaCardProps {
  usage: UsageStat | undefined;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  /** Hide the upgrade link (e.g. on the usage page where plans are listed below). */
  showUpgrade?: boolean;
  className?: string;
}

export function QuotaCard({ usage, isPending, error, onRetry, showUpgrade = true, className }: QuotaCardProps) {
  const t = useTranslations("overview.quota");
  const f = useFormatters();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        {usage ? (
          <p className="text-xs text-muted-foreground">
            {t("period", { start: f.date(usage.periodStart), end: f.date(usage.periodEnd) })}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3">
        {error ? (
          <ErrorState error={error} onRetry={onRetry} compact />
        ) : isPending || !usage ? (
          <div className="grid gap-3" aria-busy>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-full" />
          </div>
        ) : (
          (() => {
            const ratio = usage.quotaUsed / usage.quotaLimit;
            const warning = ratio >= QUOTA_WARNING_RATIO;
            const over = ratio >= 1;
            return (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm tabular-nums">
                    {t("used", { used: f.number(usage.quotaUsed), limit: f.number(usage.quotaLimit) })}
                  </p>
                  <p className={cn("text-sm font-medium tabular-nums", warning && "text-warning-text", over && "text-error-text")}>
                    {f.percent(ratio, 0)}
                  </p>
                </div>
                <Progress
                  value={ratio * 100}
                  tone={over ? "error" : warning ? "warning" : "accent"}
                  aria-label={t("title")}
                />
                {warning ? (
                  <div className="flex flex-col gap-3 rounded-md border border-warning/40 bg-warning-subtle px-3 py-2.5 text-sm text-warning-text sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex gap-2">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {t("warning", { percent: f.percent(ratio, 0) })}
                    </p>
                    {showUpgrade ? (
                      <Link href="/dashboard/usage" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}>
                        {t("upgrade")}
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </>
            );
          })()
        )}
      </CardContent>
    </Card>
  );
}
