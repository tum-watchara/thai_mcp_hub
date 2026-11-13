"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CircleAlert, Play } from "lucide-react";
import type { CallLog } from "@repo/schemas";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { cn } from "@repo/ui/lib/utils";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@repo/ui/components/sheet";
import { AppCodeBlock } from "@/components/copy-field";
import { CallStatusLabel, ClientLabel, ToolName } from "@/components/domain/badges";
import { Link } from "@/i18n/navigation";
import { useFormatters, useLocalized } from "@/lib/utils/format";
import { prettyJson } from "@/lib/utils/json";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

interface LogDetailSheetProps {
  log: CallLog | null;
  onOpenChange: (open: boolean) => void;
}

/** Right-side drawer with input, output/error and attribution for one call. */
export function LogDetailSheet({ log, onOpenChange }: LogDetailSheetProps) {
  const t = useTranslations("logs.detail");
  const tCommon = useTranslations("common");
  const localized = useLocalized();
  const f = useFormatters();

  return (
    <Sheet open={log !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" closeLabel={tCommon("close")}>
        {log ? (
          <>
            <SheetHeader>
              <SheetTitle>{t("title")}</SheetTitle>
              <SheetDescription asChild>
                <div>
                  <ToolName name={log.tool} />
                </div>
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="grid content-start gap-6">
              <dl className="divide-y divide-border">
                <Row label={t("time")}>
                  <span className="tabular-nums">{f.dateTime(log.timestamp)}</span>
                </Row>
                <Row label={t("client")}>
                  <ClientLabel client={log.client} />
                </Row>
                <Row label={t("latency")}>
                  <span className="tabular-nums">{tCommon("milliseconds", { value: log.latencyMs })}</span>
                </Row>
                <Row label={t("cache")}>{log.cached ? t("cachedYes") : t("cachedNo")}</Row>
                <Row label={t("callId")}>
                  <code className="font-mono text-xs break-all">{log.id}</code>
                </Row>
                <Row label={t("attribution")}>{localized(log.sourceAttribution)}</Row>
              </dl>
              <div className="flex items-center gap-2">
                <CallStatusLabel status={log.status} />
              </div>

              <section className="grid gap-2">
                <h3 className="text-sm font-semibold">{t("input")}</h3>
                <AppCodeBlock code={prettyJson(log.input)} language="json" maxHeight={240} />
              </section>

              {log.error ? (
                <section className="grid gap-2" role="alert">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-error-text">
                    <CircleAlert className="size-4" aria-hidden />
                    {t("error")}
                  </h3>
                  <div className="rounded-md border border-error/30 bg-error-subtle px-4 py-3 text-sm">
                    <p>{localized(log.error.message)}</p>
                    <code className="font-mono text-xs text-muted-foreground">{log.error.code}</code>
                  </div>
                </section>
              ) : (
                <section className="grid gap-2">
                  <h3 className="text-sm font-semibold">{t("output")}</h3>
                  <AppCodeBlock code={prettyJson(log.output)} language="json" maxHeight={360} />
                </section>
              )}

              <Link
                href={`/dashboard/playground?tool=${encodeURIComponent(log.tool)}`}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-fit")}
              >
                <Play aria-hidden />
                {t("openInPlayground")}
              </Link>
            </SheetBody>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
