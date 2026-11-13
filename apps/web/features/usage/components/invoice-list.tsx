"use client";

import { useTranslations } from "next-intl";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Download, FileText } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@repo/schemas";
import { Button } from "@repo/ui/components/button";
import { StatusDot, type StatusTone } from "@repo/ui/components/status-dot";
import { toast } from "@repo/ui/components/toaster";
import { DataTable, DataTableSkeleton } from "@/components/data-table";
import { EmptyState, ErrorState } from "@/components/states";
import { Link } from "@/i18n/navigation";
import { useInvoicesQuery } from "@/lib/query/usage";
import { useFormatters } from "@/lib/utils/format";

const TONE: Record<InvoiceStatus, StatusTone> = { paid: "success", open: "warning", void: "neutral" };

export function InvoiceList() {
  const t = useTranslations("usage.invoices");
  const tPlans = useTranslations("plans.name");
  const invoices = useInvoicesQuery();
  const f = useFormatters();
  const download = (invoice: Invoice) => (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={t("downloadFor", { number: invoice.number })}
      onClick={() => toast.message(t("downloadMock"))}
    >
      <Download aria-hidden />
    </Button>
  );
  const status = (invoice: Invoice) => <StatusDot tone={TONE[invoice.status]} label={t(`statuses.${invoice.status}`)} />;
  const columns: ColumnDef<Invoice>[] = [
    { id: "number", header: t("number"), cell: ({ row }) => <span className="font-mono text-[13px]">{row.original.number}</span> },
    { id: "period", header: t("period"), cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{f.date(row.original.periodStart)} – {f.date(row.original.periodEnd)}</span> },
    { id: "plan", header: t("plan"), cell: ({ row }) => tPlans(row.original.planId) },
    { id: "amount", header: t("amount"), cell: ({ row }) => <span className="tabular-nums">{f.currency(row.original.amountThb)}</span> },
    { id: "status", header: t("status"), cell: ({ row }) => status(row.original) },
    { id: "download", header: () => <span className="sr-only">{t("download")}</span>, cell: ({ row }) => download(row.original) },
  ];
  const table = useReactTable({ data: invoices.data ?? [], columns, getCoreRowModel: getCoreRowModel(), getRowId: (row) => row.id });

  if (invoices.isError) return <ErrorState error={invoices.error} onRetry={() => invoices.refetch()} retrying={invoices.isFetching} />;
  if (invoices.isPending) return <DataTableSkeleton columns={6} rows={3} />;
  if (invoices.data.length === 0) {
    return (
      <EmptyState icon={<FileText />} title={t("empty")} compact>
        <Link href="/pricing" className="inline-flex min-h-10 items-center text-sm text-accent hover:underline">{t("viewPlans")}</Link>
      </EmptyState>
    );
  }

  return (
    <DataTable
      table={table}
      renderMobileRow={({ original: invoice }) => (
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[13px]">{invoice.number}</span>
            {download(invoice)}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">{t("period")}</dt>
            <dd className="tabular-nums">{f.date(invoice.periodStart)} – {f.date(invoice.periodEnd)}</dd>
            <dt className="text-muted-foreground">{t("plan")}</dt><dd>{tPlans(invoice.planId)}</dd>
            <dt className="text-muted-foreground">{t("amount")}</dt><dd className="tabular-nums">{f.currency(invoice.amountThb)}</dd>
            <dt className="text-muted-foreground">{t("status")}</dt><dd>{status(invoice)}</dd>
          </dl>
        </div>
      )}
    />
  );
}
