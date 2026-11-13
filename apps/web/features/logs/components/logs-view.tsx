"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Database, SearchX } from "lucide-react";
import {
  CallClientSchema,
  CallStatusSchema,
  type CallClient,
  type CallLog,
  type CallStatus,
  type LogListParams,
  type LogSortField,
} from "@repo/schemas";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { DataTable, DataTableSkeleton } from "@/components/data-table";
import { CallStatusLabel, ClientLabel, ToolName } from "@/components/domain/badges";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/states";
import { useLogsQuery } from "@/lib/query/logs";
import { useSourcesQuery } from "@/lib/query/sources";
import { useFormatters, useLocalized } from "@/lib/utils/format";
import { LOG_RANGES, rangeToFrom, type LogRange } from "../lib/range";
import { LogDetailSheet } from "./log-detail-sheet";
import { LogsEmptyState } from "./logs-empty-state";

const ALL = "all";
const PAGE_SIZE = 20;

interface Filters {
  range: LogRange;
  status?: CallStatus;
  sourceId?: string;
  client?: CallClient;
}

const DEFAULT_FILTERS: Filters = { range: "d30" };

interface SortState {
  by: LogSortField;
  dir: "asc" | "desc";
}

function SortIcon({ field, sort }: { field: LogSortField; sort: SortState }) {
  if (sort.by !== field) return <ArrowUpDown className="size-3.5" aria-hidden />;
  return sort.dir === "desc" ? <ArrowDown className="size-3.5" aria-hidden /> : <ArrowUp className="size-3.5" aria-hidden />;
}

export function LogsView() {
  const t = useTranslations("logs");
  const tCommon = useTranslations("common");
  const tClients = useTranslations("clients");
  const localized = useLocalized();
  const f = useFormatters();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ by: "timestamp", dir: "desc" });
  const [selected, setSelected] = useState<CallLog | null>(null);

  const params: LogListParams = {
    page,
    pageSize: PAGE_SIZE,
    from: rangeToFrom(filters.range),
    status: filters.status,
    sourceId: filters.sourceId,
    client: filters.client,
    sortBy: sort.by,
    sortDir: sort.dir,
  };
  const query = useLogsQuery(params);
  const sources = useSourcesQuery();

  const updateFilters = (patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };
  const isFiltered = filters.range !== DEFAULT_FILTERS.range || filters.status || filters.sourceId || filters.client;

  const toggleSort = (by: LogSortField) => {
    setSort((current) => (current.by === by ? { by, dir: current.dir === "desc" ? "asc" : "desc" } : { by, dir: "desc" }));
    setPage(1);
  };

  const columns = useMemo<ColumnDef<CallLog>[]>(
    () => [
      {
        id: "time",
        header: () => (
          <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("timestamp")} aria-label={t("sortByTime")}>
            {t("columns.time")}
            <SortIcon field="timestamp" sort={sort} />
          </button>
        ),
        cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{f.dateTime(row.original.timestamp)}</span>,
      },
      { id: "tool", header: t("columns.tool"), cell: ({ row }) => <ToolName name={row.original.tool} /> },
      { id: "client", header: t("columns.client"), cell: ({ row }) => <ClientLabel client={row.original.client} /> },
      { id: "status", header: t("columns.status"), cell: ({ row }) => <CallStatusLabel status={row.original.status} /> },
      {
        id: "latency",
        header: () => (
          <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("latencyMs")} aria-label={t("sortByLatency")}>
            {t("columns.latency")}
            <SortIcon field="latencyMs" sort={sort} />
          </button>
        ),
        cell: ({ row }) => <span className="tabular-nums">{tCommon("milliseconds", { value: row.original.latencyMs })}</span>,
      },
      {
        id: "cached",
        header: t("columns.cached"),
        cell: ({ row }) =>
          row.original.cached ? (
            <Badge tone="accent">
              <Database aria-hidden />
              {t("cachedYes")}
            </Badge>
          ) : (
            <span className="text-muted-foreground">{tCommon("none")}</span>
          ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sort state drives header icons
    [t, tCommon, f, sort],
  );

  const table = useReactTable({
    data: query.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    manualPagination: true,
    manualSorting: true,
    pageCount: query.data?.pageCount ?? 1,
  });

  const meta = query.data;
  const from = meta && meta.total > 0 ? (meta.page - 1) * meta.pageSize + 1 : 0;
  const to = meta ? Math.min(meta.page * meta.pageSize, meta.total) : 0;

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
        <div className="flex rounded-md border border-border-strong p-0.5" role="group" aria-label={t("filters.range")}>
          {LOG_RANGES.map((range) => (
            <Button
              key={range}
              variant="ghost"
              size="sm"
              aria-pressed={filters.range === range}
              className={filters.range === range ? "flex-1 bg-hover font-medium" : "flex-1 text-muted-foreground"}
              onClick={() => updateFilters({ range })}
            >
              {t(`filters.rangeOptions.${range}`)}
            </Button>
          ))}
        </div>
        <Select
          value={filters.status ?? ALL}
          onValueChange={(value) => updateFilters({ status: value === ALL ? undefined : CallStatusSchema.parse(value) })}
        >
          <SelectTrigger aria-label={t("filters.status")} className="lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allStatuses")}</SelectItem>
            {CallStatusSchema.options.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`status.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.sourceId ?? ALL} onValueChange={(value) => updateFilters({ sourceId: value === ALL ? undefined : value })}>
          <SelectTrigger aria-label={t("filters.source")} className="lg:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allSources")}</SelectItem>
            {(sources.data ?? []).map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {localized(source.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.client ?? ALL}
          onValueChange={(value) => updateFilters({ client: value === ALL ? undefined : CallClientSchema.parse(value) })}
        >
          <SelectTrigger aria-label={t("filters.client")} className="lg:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allClients")}</SelectItem>
            {CallClientSchema.options.map((client) => (
              <SelectItem key={client} value={client}>
                {tClients(client)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltered ? (
          <Button variant="ghost" size="sm" onClick={() => updateFilters({ ...DEFAULT_FILTERS, status: undefined, sourceId: undefined, client: undefined })}>
            {t("filters.reset")}
          </Button>
        ) : null}
      </div>

      {query.isError && !query.data ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} />
      ) : query.isPending ? (
        <DataTableSkeleton columns={6} rows={10} />
      ) : query.data.total === 0 ? (
        isFiltered ? (
          <EmptyState icon={<SearchX />} title={t("emptyFiltered.title")} description={t("emptyFiltered.description")}>
            <Button variant="secondary" size="sm" onClick={() => updateFilters({ ...DEFAULT_FILTERS, status: undefined, sourceId: undefined, client: undefined })}>
              {t("filters.reset")}
            </Button>
          </EmptyState>
        ) : (
          <LogsEmptyState />
        )
      ) : (
        <div className={query.isFetching ? "opacity-70 transition-opacity" : undefined} aria-busy={query.isFetching}>
          {query.isError ? (
            <ErrorState error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} compact className="mb-3" />
          ) : null}
          <DataTable
            table={table}
            maxHeight="calc(100dvh - 320px)"
            onRowClick={(row) => setSelected(row.original)}
            rowLabel={(row) => `${row.original.tool} · ${f.dateTime(row.original.timestamp)}`}
            renderMobileRow={(row) => (
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <ToolName name={row.original.tool} className="truncate" />
                  <CallStatusLabel status={row.original.status} />
                </div>
                <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground tabular-nums">
                  <span>{f.dateTime(row.original.timestamp)}</span>
                  <ClientLabel client={row.original.client} />
                  <span>{tCommon("milliseconds", { value: row.original.latencyMs })}</span>
                  {row.original.cached ? <span>{t("cachedYes")}</span> : null}
                </p>
              </div>
            )}
            footer={
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <p className="text-muted-foreground tabular-nums">
                  {t("pagination.summary", { from: f.number(from), to: f.number(to), total: f.number(query.data.total) })}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="icon-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label={t("pagination.previous")}>
                    <ChevronLeft aria-hidden />
                  </Button>
                  <span className="tabular-nums">
                    {t("pagination.page", { page: query.data.page, pageCount: query.data.pageCount })}
                  </span>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => setPage((p) => Math.min(query.data.pageCount, p + 1))}
                    disabled={page >= query.data.pageCount}
                    aria-label={t("pagination.next")}
                  >
                    <ChevronRight aria-hidden />
                  </Button>
                </div>
              </div>
            }
          />
        </div>
      )}

      <LogDetailSheet log={selected} onOpenChange={(open) => (open ? undefined : setSelected(null))} />
    </>
  );
}
