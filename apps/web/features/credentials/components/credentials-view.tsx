"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { KeyRound, MoreHorizontal, Plus, RefreshCw, Trash2 } from "lucide-react";
import type { Credential, CredentialStatus } from "@repo/schemas";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { StatusDot, type StatusTone } from "@repo/ui/components/status-dot";
import { DataTable, DataTableSkeleton } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/states";
import { useCredentialsQuery } from "@/lib/query/credentials";
import { useSourcesQuery } from "@/lib/query/sources";
import { useFormatters, useLocalized } from "@/lib/utils/format";
import { AddCredentialDialog, DeleteCredentialDialog, RotateCredentialDialog } from "./credential-dialogs";

const STATUS_TONE: Record<CredentialStatus, StatusTone> = { active: "success", invalid: "error", expired: "warning" };

export function CredentialsView() {
  const t = useTranslations("credentials");
  const tCommon = useTranslations("common");
  const localized = useLocalized();
  const f = useFormatters();
  const searchParams = useSearchParams();
  const requestedSource = searchParams.get("add") ?? undefined;

  const credentials = useCredentialsQuery();
  const sources = useSourcesQuery();
  const byokSources = useMemo(() => (sources.data ?? []).filter((s) => s.requiresCredential), [sources.data]);

  const [addOpen, setAddOpen] = useState(Boolean(requestedSource));
  const [rotating, setRotating] = useState<Credential | null>(null);
  const [deleting, setDeleting] = useState<Credential | null>(null);

  const sourceName = (id: string) => {
    const source = sources.data?.find((s) => s.id === id);
    return source ? localized(source.name) : id;
  };

  const actions = (credential: Credential) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t("actionsFor", { label: credential.label })}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setRotating(credential)}>
          <RefreshCw aria-hidden />
          {t("rotate")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setDeleting(credential)} className="text-error-text [&_svg]:text-error-text">
          <Trash2 aria-hidden />
          {t("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const columns: ColumnDef<Credential>[] = [
    { id: "label", header: t("columns.label"), cell: ({ row }) => <span className="font-medium">{row.original.label}</span> },
    { id: "source", header: t("columns.source"), cell: ({ row }) => sourceName(row.original.sourceId) },
    {
      id: "value",
      header: t("columns.value"),
      cell: ({ row }) => <code className="font-mono text-[13px] text-muted-foreground">{row.original.maskedValue}</code>,
    },
    { id: "created", header: t("columns.created"), cell: ({ row }) => f.date(row.original.createdAt) },
    {
      id: "lastUsed",
      header: t("columns.lastUsed"),
      cell: ({ row }) => (row.original.lastUsedAt ? f.relative(row.original.lastUsedAt) : <span className="text-muted-foreground">{tCommon("never")}</span>),
    },
    {
      id: "status",
      header: t("columns.status"),
      cell: ({ row }) => <StatusDot tone={STATUS_TONE[row.original.status]} label={t(`status.${row.original.status}`)} />,
    },
    { id: "actions", header: () => <span className="sr-only">{t("columns.actions")}</span>, size: 56, cell: ({ row }) => actions(row.original) },
  ];

  const table = useReactTable({
    data: credentials.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button variant="primary" onClick={() => setAddOpen(true)} disabled={!sources.data}>
            <Plus aria-hidden />
            {t("add")}
          </Button>
        }
      />

      {credentials.isError || sources.isError ? (
        <ErrorState
          error={credentials.error ?? sources.error}
          onRetry={() => { void credentials.refetch(); void sources.refetch(); }}
          retrying={credentials.isFetching || sources.isFetching}
        />
      ) : credentials.isPending || sources.isPending ? (
        <DataTableSkeleton columns={7} rows={3} />
      ) : credentials.data.length === 0 ? (
        <EmptyState icon={<KeyRound />} title={t("empty.title")} description={t("empty.description")}>
          <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
            <Plus aria-hidden />
            {t("add")}
          </Button>
        </EmptyState>
      ) : (
        <DataTable
          table={table}
          renderMobileRow={(row) => (
            <div className="flex items-start justify-between gap-3">
              <div className="grid min-w-0 gap-1">
                <span className="font-medium">{row.original.label}</span>
                <span className="text-xs text-muted-foreground">{sourceName(row.original.sourceId)}</span>
                <code className="font-mono text-xs text-muted-foreground">{row.original.maskedValue}</code>
                <span className="text-xs text-muted-foreground">
                  {t("columns.lastUsed")}: {row.original.lastUsedAt ? f.relative(row.original.lastUsedAt) : tCommon("never")}
                </span>
                <StatusDot tone={STATUS_TONE[row.original.status]} label={t(`status.${row.original.status}`)} className="text-xs" />
              </div>
              {actions(row.original)}
            </div>
          )}
        />
      )}

      {sources.data ? (
        <AddCredentialDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          byokSources={byokSources}
          defaultSourceId={requestedSource && byokSources.some((s) => s.id === requestedSource) ? requestedSource : undefined}
          key={`${requestedSource ?? "none"}:${byokSources.length}`}
        />
      ) : null}
      <RotateCredentialDialog credential={rotating} onOpenChange={(open) => (open ? undefined : setRotating(null))} />
      <DeleteCredentialDialog
        credential={deleting}
        sourceName={deleting ? sourceName(deleting.sourceId) : ""}
        onOpenChange={(open) => (open ? undefined : setDeleting(null))}
      />
    </>
  );
}
