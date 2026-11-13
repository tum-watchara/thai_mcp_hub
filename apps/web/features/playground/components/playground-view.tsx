"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { JsonObject, ToolRunResult } from "@repo/schemas";
import { Button } from "@repo/ui/components/button";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Field } from "@repo/ui/components/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/states";
import { Link } from "@/i18n/navigation";
import { useSourcesQuery } from "@/lib/query/sources";
import { useRunToolMutation, useToolsQuery } from "@/lib/query/tools";
import { useLocalized } from "@/lib/utils/format";
import { useRunHistory } from "../hooks/use-run-history";
import { ResultPanel } from "./result-panel";
import { RunHistory } from "./run-history";
import { ToolForm } from "./tool-form";

export function PlaygroundView() {
  const searchParams = useSearchParams();
  const requestedTool = searchParams.get("tool");
  return <PlaygroundSession key={requestedTool ?? "default"} requestedTool={requestedTool} />;
}

function PlaygroundSession({ requestedTool }: { requestedTool: string | null }) {
  const t = useTranslations("playground");
  const localized = useLocalized();
  const tools = useToolsQuery({ enabledOnly: true });
  const sources = useSourcesQuery();
  const run = useRunToolMutation();
  const history = useRunHistory();

  const [selectedName, setSelectedName] = useState<string | null>(requestedTool);
  const [initialInput, setInitialInput] = useState<JsonObject | undefined>();
  const [result, setResult] = useState<ToolRunResult | null>(null);
  const [lastInput, setLastInput] = useState<JsonObject | null>(null);

  const selectedTool = useMemo(() => {
    const list = tools.data ?? [];
    return selectedName ? list.find((tool) => tool.name === selectedName) : list[0];
  }, [tools.data, selectedName]);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const tool of tools.data ?? []) map.set(tool.sourceId, [...(map.get(tool.sourceId) ?? []), tool.name]);
    return [...map.entries()];
  }, [tools.data]);

  const sourceName = (id: string) => {
    const source = sources.data?.find((s) => s.id === id);
    return source ? localized(source.name) : id;
  };

  const execute = (input: JsonObject) => {
    if (!selectedTool || run.isPending) return;
    setResult(null);
    setLastInput(input);
    run.mutate(
      { tool: selectedTool.name, input, client: "api" },
      {
        onSuccess: (data) => {
          setResult(data);
          history.add(data);
        },
      },
    );
  };

  const selectTool = (name: string) => {
    setSelectedName(name);
    setInitialInput(undefined);
    setResult(null);
    run.reset();
  };

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      {tools.isError ? (
        <ErrorState error={tools.error} onRetry={() => tools.refetch()} retrying={tools.isFetching} />
      ) : tools.isPending ? (
        <div className="grid gap-4 lg:grid-cols-2" aria-busy>
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : !selectedTool && selectedName && tools.data.length > 0 ? (
        <EmptyState title={t("unavailable.title")} description={t("unavailable.description")}>
          <Button variant="secondary" onClick={() => {
            setSelectedName(null);
            setInitialInput(undefined);
            setResult(null);
            run.reset();
          }}>
            {t("unavailable.action")}
          </Button>
          <Link href="/dashboard/sources" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            {t("noTools.action")}
          </Link>
        </EmptyState>
      ) : !selectedTool ? (
        <EmptyState title={t("noTools.title")} description={t("noTools.description")}>
          <Link href="/dashboard/sources" className={buttonVariants({ variant: "primary", size: "sm" })}>
            {t("noTools.action")}
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="grid content-start gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("input")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5">
                <Field id="playground-tool" label={t("selectTool")} helper={t("toolHelper")}>
                  <Select value={selectedTool.name} onValueChange={selectTool} disabled={run.isPending}>
                    <SelectTrigger id="playground-tool">
                      <SelectValue placeholder={t("selectToolPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {grouped.map(([sourceId, names]) => (
                        <SelectGroup key={sourceId}>
                          <SelectLabel>{sourceName(sourceId)}</SelectLabel>
                          {names.map((name) => (
                            <SelectItem key={name} value={name}>
                              <span className="font-mono text-[13px]">{name}</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <p className="text-sm text-muted-foreground">{localized(selectedTool.description)}</p>
                <ToolForm
                  key={`${selectedTool.name}:${JSON.stringify(initialInput ?? null)}`}
                  tool={selectedTool}
                  initialInput={initialInput}
                  running={run.isPending}
                  onRun={execute}
                />
              </CardContent>
            </Card>
            <RunHistory
              entries={history.entries}
              disabled={run.isPending}
              onClear={history.clear}
              onRestore={(entry) => {
                setSelectedName(entry.tool);
                setInitialInput(entry.input);
                setLastInput(entry.input);
                setResult(entry);
                run.reset();
              }}
            />
          </div>
          <ResultPanel
            result={result}
            running={run.isPending}
            requestError={run.error}
            onRetry={() => {
              if (lastInput) execute(lastInput);
            }}
          />
        </div>
      )}
    </>
  );
}
