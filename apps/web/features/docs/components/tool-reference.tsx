"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ToolName } from "@/components/domain/badges";
import { ToolParams } from "@/components/domain/tool-params";
import { SearchInput } from "@/components/domain/source-filters";
import { AppCodeBlock } from "@/components/copy-field";
import { ErrorState } from "@/components/states";
import { useSourcesQuery } from "@/lib/query/sources";
import { useToolsQuery } from "@/lib/query/tools";
import { useFormatters, useLocalized } from "@/lib/utils/format";
import { prettyJson } from "@/lib/utils/json";

/** Tool reference generated from the tool catalogue (same data the MCP server exposes). */
export function ToolReference() {
  const t = useTranslations("docs.toolReference");
  const tSource = useTranslations("sourceDetail");
  const localized = useLocalized();
  const f = useFormatters();
  const tools = useToolsQuery();
  const sources = useSourcesQuery();
  const [filter, setFilter] = useState("");

  const grouped = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = (tools.data ?? []).filter((tool) => (q ? `${tool.name} ${tool.sourceId}`.includes(q) : true));
    const map = new Map<string, typeof list>();
    for (const tool of list) map.set(tool.sourceId, [...(map.get(tool.sourceId) ?? []), tool]);
    return [...map.entries()];
  }, [tools.data, filter]);

  if (tools.isError) {
    return <ErrorState error={tools.error} onRetry={() => tools.refetch()} retrying={tools.isFetching} />;
  }
  if (tools.isPending) {
    return (
      <div className="not-prose grid gap-4" aria-busy>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  const sourceName = (id: string) => {
    const source = sources.data?.find((s) => s.id === id);
    return source ? localized(source.name) : id;
  };

  return (
    <div className="grid gap-8">
      <SearchInput value={filter} onChange={setFilter} placeholder={t("filter")} className="max-w-sm" />
      {grouped.map(([sourceId, sourceTools]) => (
        <section key={sourceId} className="grid gap-4">
          <h2 id={`source-${sourceId}`}>{sourceName(sourceId)}</h2>
          {sourceTools.map((tool) => (
            <article key={tool.name} id={tool.name} className="grid gap-3 rounded-lg border border-border p-4 text-sm">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="m-0! text-base">
                  <ToolName name={tool.name} className="text-sm font-semibold" />
                </h3>
                <span className="text-xs text-muted-foreground">
                  {t("cache")}: {tool.cacheTtl > 0 ? f.duration(tool.cacheTtl) : tSource("noCache")}
                </span>
              </header>
              <p className="m-0! text-muted-foreground">{localized(tool.description)}</p>
              <div className="grid gap-1.5">
                <p className="m-0! text-xs font-medium text-muted-foreground">{t("parameters")}</p>
                <ToolParams schema={tool.inputSchema} />
              </div>
              <AppCodeBlock code={prettyJson(tool.exampleInput)} language="json" title={t("example")} />
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
