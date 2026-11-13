"use client";

import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { DailyUsage, Source, SourceUsage } from "@repo/schemas";
import { useFormatters, useLocalized } from "@/lib/utils/format";

const AXIS_TICK = { fontSize: 12, fill: "var(--text-muted)" } as const;

function ChartTooltip({ active, payload, label, formatLabel, formatValue }: Pick<TooltipContentProps, "active" | "payload" | "label"> & {
  formatLabel: (label: string) => string;
  formatValue: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium">{formatLabel(String(label))}</p>
      <ul className="grid gap-0.5">
        {payload.map((entry) => (
          <li key={String(entry.dataKey)} className="flex items-center gap-2 tabular-nums">
            <span aria-hidden className="size-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium">{formatValue(Number(entry.value))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Calls per day over the period, with errors as a muted comparison series. */
export function CallsPerDayChart({ data }: { data: DailyUsage[] }) {
  const t = useTranslations("overview.charts");
  const f = useFormatters();
  return (
    <div className="h-64 w-full" role="img" aria-label={t("callsPerDay")}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            tickFormatter={(value: string) => f.shortDate(value)}
            minTickGap={24}
          />
          <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} tickFormatter={(value: number) => f.compact(value)} width={48} />
          <Tooltip
            cursor={{ stroke: "var(--border-strong)" }}
            content={(props) => (
              <ChartTooltip {...props} formatLabel={(label) => f.date(label)} formatValue={(value) => f.number(value)} />
            )}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Line type="monotone" dataKey="calls" name={t("calls")} stroke="var(--chart-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line
            type="monotone"
            dataKey="errors"
            name={t("errors")}
            stroke="var(--chart-3)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Horizontal bars with direct value labels. */
export function CallsBySourceChart({ data, sources }: { data: SourceUsage[]; sources: Source[] | undefined }) {
  const t = useTranslations("overview.charts");
  const f = useFormatters();
  const localized = useLocalized();
  const rows = [...data]
    .sort((a, b) => b.calls - a.calls)
    .map((row) => {
      const source = sources?.find((s) => s.id === row.sourceId);
      return { ...row, label: source ? localized(source.name) : row.sourceId };
    });

  return (
    <div className="w-full" style={{ height: Math.max(200, rows.length * 34 + 16) }} role="img" aria-label={t("callsBySource")}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 0 }} barCategoryGap={8}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            width={170}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: "var(--hover)" }}
            content={(props) => (
              <ChartTooltip {...props} formatLabel={(label) => label} formatValue={(value) => f.number(value)} />
            )}
          />
          <Bar dataKey="calls" name={t("calls")} fill="var(--chart-1)" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="calls"
              position="right"
              formatter={(value: unknown) => f.number(Number(value))}
              style={{ fontSize: 12, fill: "var(--text)" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
