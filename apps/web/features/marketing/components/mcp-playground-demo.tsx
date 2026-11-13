"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronRight, Clock3, Code2, FlaskConical, Loader2 } from "lucide-react";
import type { JsonObject } from "@repo/schemas";
import { Badge } from "@repo/ui/components/badge";
import { Field } from "@repo/ui/components/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { AppCodeBlock } from "@/components/copy-field";
import { EmptyState, ErrorState } from "@/components/states";
import { ToolForm } from "@/features/playground/components/tool-form";
import { Link } from "@/i18n/navigation";
import { useDemoToolsQuery, useRunDemoMutation } from "@/lib/query/demo";
import { useLocalized } from "@/lib/utils/format";
import { DemoResult } from "./demo-result";

export function McpPlaygroundDemo() {
  const t = useTranslations("landing.playground");
  const localized = useLocalized();
  const tools = useDemoToolsQuery();
  const run = useRunDemoMutation();
  const [selected, setSelected] = useState("dbd.company_lookup");
  const [lastInput, setLastInput] = useState<JsonObject | null>(null);
  const tool = tools.data?.find((entry) => entry.name === selected) ?? tools.data?.[0];
  const result = run.data;
  const failed = run.isError || result?.status === "error";
  const preview = result?.output ?? tool?.exampleOutput;

  const execute = (input: JsonObject) => {
    if (!tool || run.isPending) return;
    setLastInput(input);
    run.mutate({ tool: tool.name, input });
  };

  return (
    <section id="playground-demo" aria-labelledby="demo-title" className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Code2 className="size-5 text-accent" aria-hidden />
          <div>
            <h3 id="demo-title" className="text-sm font-semibold">{t("title")}</h3>
            <p className="font-mono text-[11px] text-muted-foreground">{t("environment")}</p>
          </div>
        </div>
        <Badge tone="outline"><FlaskConical aria-hidden />{t("badge")}</Badge>
      </header>

      {tools.isError ? (
        <div className="min-h-[560px] p-6"><ErrorState error={tools.error} onRetry={() => tools.refetch()} retrying={tools.isFetching} /></div>
      ) : tools.isPending ? (
        <div className="grid min-h-[704px] content-start gap-6 p-4 sm:min-h-[656px] sm:p-6" aria-busy>
          <Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" /><Skeleton className="h-10 w-40" /><Skeleton className="h-48 w-full" />
        </div>
      ) : !tool ? (
        <div className="min-h-[560px] p-6"><EmptyState title={t("empty")} description={t("emptyHelp")}><Link href="/docs" className={buttonVariants({ variant: "secondary" })}>{t("docs")}</Link></EmptyState></div>
      ) : (
        <div className="grid lg:grid-cols-2">
          <div className="grid content-start gap-5 p-4 sm:p-6">
            <Field id="demo-tool" label={t("tool")}>
              <Select value={tool.name} disabled={run.isPending} onValueChange={(value) => { setSelected(value); setLastInput(null); run.reset(); }}>
                <SelectTrigger id="demo-tool" className="h-11 font-mono text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>{tools.data.map((entry) => <SelectItem key={entry.name} value={entry.name}><span className="font-mono text-[13px]">{entry.name}</span></SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <ToolForm key={tool.name} tool={tool} running={run.isPending} onRun={execute} submitLabel={t("execute")} idPrefix="public-demo" />
          </div>

          <div className="border-t border-border bg-subtle p-4 sm:p-6 lg:border-t-0 lg:border-l">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">{t("result")}</span>
              <span role="status" aria-live="polite" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                {run.isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : result?.status === "success" ? <Check className="size-3.5 text-success-text" aria-hidden /> : <span className="size-1.5 rounded-full bg-current" aria-hidden />}
                {t(run.isPending ? "running" : failed ? "failed" : result ? "success" : "ready")}
              </span>
            </div>
            <div className="min-h-[256px] rounded-lg border border-border bg-card p-4 sm:min-h-[208px]" aria-busy={run.isPending}>
              {run.isPending ? (
                <div className="grid gap-4"><Skeleton className="h-6 w-4/5" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-2/3" /></div>
              ) : run.isError ? (
                <ErrorState error={run.error} onRetry={() => { if (lastInput) execute(lastInput); }} compact />
              ) : result?.status === "error" && result.error ? (
                <div role="alert" className="grid gap-2 text-sm"><p className="font-medium text-error-text">{t("failed")}</p><p>{localized(result.error.message)}</p><p className="text-muted-foreground">{t("errorHelp")}</p></div>
              ) : (
                <DemoResult tool={tool.name} output={preview} />
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{t("sampleSource")}</span>
              {result && !run.isPending ? <span className="inline-flex items-center gap-1 font-mono tabular-nums"><Clock3 className="size-3" aria-hidden />{t("latency", { ms: result.latencyMs })}</span> : null}
            </div>
            {run.isPending ? <div className="mt-4 min-h-[53px] border-t border-border pt-3" /> : <details key={`${tool.name}:${result?.id ?? "preview"}`} className="group mt-4 border-t border-border pt-3">
              <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-sm text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden />{t("raw")}
              </summary>
              <AppCodeBlock code={JSON.stringify(result ?? { tool: tool.name, input: tool.exampleInput, output: preview, demo: true }, null, 2)} language="json" maxHeight={280} />
            </details>}
          </div>
        </div>
      )}
      <p className="border-t border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground sm:px-6">{t("notice")}</p>
    </section>
  );
}
