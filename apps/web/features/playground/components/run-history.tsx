"use client";

import { useTranslations } from "next-intl";
import { History, Trash2 } from "lucide-react";
import type { ToolRunResult } from "@repo/schemas";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { StatusDot } from "@repo/ui/components/status-dot";
import { ToolName } from "@/components/domain/badges";
import { useFormatters } from "@/lib/utils/format";

interface RunHistoryProps {
  entries: ToolRunResult[];
  disabled?: boolean;
  onRestore: (entry: ToolRunResult) => void;
  onClear: () => void;
}

export function RunHistory({ entries, disabled, onRestore, onClear }: RunHistoryProps) {
  const t = useTranslations("playground.history");
  const tStatus = useTranslations("logs.status");
  const tCommon = useTranslations("common");
  const f = useFormatters();

  return (
    <Card>
      <CardHeader>
        <div className="grid gap-1">
          <CardTitle className="flex items-center gap-2">
            <History className="size-4 text-muted-foreground" aria-hidden />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </div>
        {entries.length ? (
          <Button variant="ghost" size="sm" onClick={onClear} disabled={disabled}>
            <Trash2 aria-hidden />
            {t("clear")}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="pt-2">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onRestore(entry)}
                  className="grid w-full gap-1 py-2.5 text-left hover:bg-subtle focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50"
                  aria-label={`${t("restore")}: ${entry.tool}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <ToolName name={entry.tool} className="truncate" />
                    <span className="text-xs text-muted-foreground tabular-nums">{f.time(entry.timestamp)}</span>
                  </span>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                    <StatusDot
                      tone={entry.status === "success" ? "success" : "error"}
                      label={tStatus(entry.status)}
                      className="text-xs"
                    />
                    <span className="tabular-nums">{tCommon("milliseconds", { value: entry.latencyMs })}</span>
                    <span className="truncate font-mono">{JSON.stringify(entry.input)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
