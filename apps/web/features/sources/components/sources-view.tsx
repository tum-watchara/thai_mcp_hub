"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { SearchX } from "lucide-react";
import type { Source, SourceCategory, SourceEnabledFilter } from "@repo/schemas";
import { Button } from "@repo/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { DataTable, DataTableSkeleton } from "@/components/data-table";
import { LicenseBadge, SourceStatusLabel } from "@/components/domain/badges";
import { CategorySelect, SearchInput } from "@/components/domain/source-filters";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/states";
import { Link, useRouter } from "@/i18n/navigation";
import { useSourcesQuery } from "@/lib/query/sources";
import { useWorkspaceQuery } from "@/lib/query/workspace";
import { useLocalized } from "@/lib/utils/format";
import { useDebouncedValue } from "@/lib/utils/use-debounced-value";
import { SourceToggle } from "./source-toggle";

const ENABLED_FILTERS: readonly SourceEnabledFilter[] = ["all", "enabled", "disabled"];

export function SourcesView() {
  const t = useTranslations("dashboardSources");
  const tMeta = useTranslations("sourceMeta");
  const tCommon = useTranslations("common");
  const localized = useLocalized();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SourceCategory | undefined>();
  const [enabled, setEnabled] = useState<SourceEnabledFilter>("all");
  const debouncedSearch = useDebouncedValue(search);

  const filtered = useSourcesQuery({ search: debouncedSearch || undefined, category, enabled });
  const all = useSourcesQuery();
  const workspace = useWorkspaceQuery();
  const planId = workspace.data?.planId;

  const columns = useMemo<ColumnDef<Source>[]>(
    () => [
      {
        id: "name",
        header: t("columns.name"),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/sources/${row.original.id}`}
            className="font-medium hover:text-accent"
            onClick={(event) => event.stopPropagation()}
          >
            {localized(row.original.name)}
          </Link>
        ),
      },
      {
        id: "provider",
        header: t("columns.provider"),
        cell: ({ row }) => <span className="text-muted-foreground">{localized(row.original.provider)}</span>,
      },
      {
        id: "category",
        header: t("columns.category"),
        cell: ({ row }) => <span className="whitespace-nowrap">{tMeta(`category.${row.original.category}`)}</span>,
      },
      { id: "tools", header: t("columns.tools"), size: 72, cell: ({ row }) => row.original.toolCount },
      { id: "status", header: t("columns.status"), cell: ({ row }) => <SourceStatusLabel status={row.original.status} /> },
      { id: "license", header: t("columns.license"), cell: ({ row }) => <LicenseBadge status={row.original.licenseStatus} /> },
      {
        id: "enabled",
        header: t("columns.enabled"),
        cell: ({ row }) => <SourceToggle source={row.original} planId={planId} />,
      },
    ],
    [t, tMeta, localized, planId],
  );

  const table = useReactTable({
    data: filtered.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const enabledSources = (all.data ?? []).filter((source) => source.enabled);
  const visibleTools = enabledSources.reduce((sum, source) => sum + source.toolCount, 0);

  const clearFilters = () => {
    setSearch("");
    setCategory(undefined);
    setEnabled("all");
  };

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder={t("searchPlaceholder")} className="md:max-w-sm md:flex-1" />
        <CategorySelect value={category} onChange={setCategory} label={t("filterCategory")} className="md:w-52" />
        <Select value={enabled} onValueChange={(value) => setEnabled(value as SourceEnabledFilter)}>
          <SelectTrigger aria-label={t("filterState")} className="md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENABLED_FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {t(`state.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.isError ? (
        <ErrorState error={filtered.error} onRetry={() => filtered.refetch()} retrying={filtered.isFetching} />
      ) : filtered.isPending ? (
        <DataTableSkeleton columns={7} rows={8} />
      ) : filtered.data.length === 0 ? (
        <EmptyState icon={<SearchX />} title={t("emptyFiltered.title")} description={t("emptyFiltered.description")}>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            {t("emptyFiltered.action")}
          </Button>
        </EmptyState>
      ) : (
        <DataTable
          table={table}
          onRowClick={(row) => router.push(`/dashboard/sources/${row.original.id}`)}
          rowLabel={(row) => localized(row.original.name)}
          isRowDisabled={(row) => row.original.licenseStatus === "pending_permission"}
          mobileRowAsButton={false}
          renderMobileRow={(row) => (
            <div className="grid gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="grid gap-0.5">
                  <Link href={`/dashboard/sources/${row.original.id}`} className="font-medium hover:text-accent">
                    {localized(row.original.name)}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {tMeta(`category.${row.original.category}`)} · {tCommon("toolCount", { count: row.original.toolCount })}
                  </span>
                </div>
                <SourceToggle source={row.original} planId={planId} />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <SourceStatusLabel status={row.original.status} />
                <LicenseBadge status={row.original.licenseStatus} />
              </div>
            </div>
          )}
          footer={
            <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
              {t("footer", { tools: visibleTools, sources: enabledSources.length })}
            </p>
          }
        />
      )}
    </>
  );
}
