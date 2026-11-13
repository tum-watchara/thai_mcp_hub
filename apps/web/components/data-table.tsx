"use client";

import type { ReactNode } from "react";
import { flexRender, type Row, type Table as TanstackTable } from "@tanstack/react-table";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/utils";

interface DataTableProps<T> {
  table: TanstackTable<T>;
  /** Stacked card used below the md breakpoint. */
  renderMobileRow: (row: Row<T>) => ReactNode;
  onRowClick?: (row: Row<T>) => void;
  /** Accessible label used for clickable rows. */
  rowLabel?: (row: Row<T>) => string;
  isRowDisabled?: (row: Row<T>) => boolean;
  footer?: ReactNode;
  className?: string;
  maxHeight?: string;
  /** Set false when mobile rows contain their own controls (no nested interactive elements). */
  mobileRowAsButton?: boolean;
}

/**
 * TanStack Table renderer: sticky header, separators only, hover tint,
 * and stacked rows on small screens.
 */
export function DataTable<T>({
  table,
  renderMobileRow,
  onRowClick,
  rowLabel,
  isRowDisabled,
  footer,
  className,
  maxHeight,
  mobileRowAsButton = true,
}: DataTableProps<T>) {
  const rows = table.getRowModel().rows;
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
      <TableContainer className="hidden md:block" style={maxHeight ? { maxHeight } : undefined}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={header.column.columnDef.size ? { width: header.column.columnDef.size } : undefined}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const disabled = isRowDisabled?.(row) ?? false;
              return (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && "cursor-pointer", disabled && "text-muted-foreground")}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-label={onRowClick && rowLabel ? rowLabel(row) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <ul className="divide-y divide-border md:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            {onRowClick && mobileRowAsButton ? (
              <button
                type="button"
                className="block w-full px-4 py-3 text-left hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                onClick={() => onRowClick(row)}
                aria-label={rowLabel?.(row)}
              >
                {renderMobileRow(row)}
              </button>
            ) : (
              <div className="px-4 py-3">{renderMobileRow(row)}</div>
            )}
          </li>
        ))}
      </ul>
      {footer ? <div className="border-t border-border px-4 py-3">{footer}</div> : null}
    </div>
  );
}

/** Skeleton matching DataTable's layout. */
export function DataTableSkeleton({ columns, rows = 6 }: { columns: number; rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card" aria-busy>
      <div className="hidden md:block">
        <div className="flex h-10 items-center gap-6 border-b border-border px-4">
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex h-14 items-center gap-6 border-b border-border px-4 last:border-0">
            {Array.from({ length: columns }, (_, c) => (
              <Skeleton key={c} className={cn("h-3.5 flex-1", c === 0 && "flex-[2]")} />
            ))}
          </div>
        ))}
      </div>
      <div className="divide-y divide-border md:hidden">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="grid gap-2 px-4 py-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
