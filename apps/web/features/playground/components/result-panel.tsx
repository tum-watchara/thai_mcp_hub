"use client";

import { useTranslations } from "next-intl";
import { CircleAlert, Clock, Database, Zap } from "lucide-react";
import type { ToolRunResult } from "@repo/schemas";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { AppCodeBlock } from "@/components/copy-field";
import { JsonView } from "@/components/domain/json-view";
import { EmptyState, ErrorState } from "@/components/states";
import { useFormatters, useLocalized } from "@/lib/utils/format";
import { prettyJson } from "@/lib/utils/json";

interface ResultPanelProps {
  result: ToolRunResult | null;
  running: boolean;
  requestError: unknown;
  onRetry: () => void;
}

export function ResultPanel({ result, running, requestError, onRetry }: ResultPanelProps) {
  const t = useTranslations("playground");
  const tCommon = useTranslations("common");
  const localized = useLocalized();
  const f = useFormatters();

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{t("result")}</CardTitle>
        {result && !running ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge tone="outline" className="tabular-nums">
              <Clock aria-hidden />
              {tCommon("milliseconds", { value: result.latencyMs })}
            </Badge>
            <Badge tone={result.cached ? "accent" : "outline"}>
              {result.cached ? <Database aria-hidden /> : <Zap aria-hidden />}
              {result.cached ? t("cached") : t("live")}
            </Badge>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4">
        {running ? (
          <div className="grid gap-3" aria-busy>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : requestError ? (
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">{t("requestFailed")}</p>
            <ErrorState error={requestError} onRetry={onRetry} compact />
          </div>
        ) : !result ? (
          <EmptyState title={t("noResult.title")} description={t("noResult.description")} compact />
        ) : (
          <>
            {result.status === "error" && result.error ? (
              <div role="alert" className="grid gap-1 rounded-md border border-error/30 bg-error-subtle px-4 py-3 text-sm">
                <p className="flex items-center gap-2 font-medium text-error-text">
                  <CircleAlert className="size-4" aria-hidden />
                  {t("toolError")}
                </p>
                <p>{localized(result.error.message)}</p>
                <code className="font-mono text-xs text-muted-foreground">{result.error.code}</code>
              </div>
            ) : (
              <Tabs defaultValue="formatted">
                <TabsList>
                  <TabsTrigger value="formatted">{t("tabs.formatted")}</TabsTrigger>
                  <TabsTrigger value="raw">{t("tabs.raw")}</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted">
                  <JsonView value={result.output} />
                </TabsContent>
                <TabsContent value="raw">
                  <AppCodeBlock code={prettyJson(result.output)} language="json" maxHeight={420} />
                </TabsContent>
              </Tabs>
            )}
            <div className="grid gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{t("source")}:</span> {localized(result.attribution)}
              </p>
              <p className="tabular-nums">{t("fetchedAt", { time: f.dateTime(result.timestamp) })}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
