"use client";

import { useLocale, useTranslations } from "next-intl";
import { Building2, CalendarDays, Type } from "lucide-react";
import type { JsonValue } from "@repo/schemas";
import { JsonView } from "@/components/domain/json-view";
import { useFormatters } from "@/lib/utils/format";
import { displayPrimitive, isJsonObject } from "@/lib/utils/json";

export function DemoResult({ tool, output }: { tool: string; output: JsonValue | undefined }) {
  const t = useTranslations("landing.playground");
  const locale = useLocale();
  const f = useFormatters();
  if (!isJsonObject(output)) return <JsonView value={output} />;

  const company = tool === "dbd.company_lookup";
  const amount = tool === "utils.baht_text";
  const Icon = company ? Building2 : amount ? Type : CalendarDays;
  const heading = company ? output[locale === "th" ? "name_th" : "name_en"] : amount ? output.text : t(output.is_workday ? "workday" : "holiday");
  const fields = company ? ["juristic_id", "status", "registered_capital"] : amount ? ["amount"] : ["date", "reason"];
  const fieldLabels: Record<string, string> = {
    juristic_id: t("fields.juristicId"), status: t("fields.status"), registered_capital: t("fields.capital"),
    amount: t("fields.amount"), date: t("fields.date"), reason: t("fields.reason"),
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <div className="grid min-w-0 gap-1">
          <p className="text-sm text-muted-foreground">{t(company ? "company" : amount ? "bahtText" : "calendar")}</p>
          <p className="break-words text-base leading-relaxed font-semibold text-foreground">{typeof heading === "string" ? heading : t("result")}</p>
        </div>
      </div>
      <dl className="grid gap-2.5 border-t border-border pt-4 text-sm">
        {fields.map((key) => {
          const value = output[key];
          if (value === undefined || value === null) return null;
          const formatted = typeof value === "number" ? (key === "amount" || key === "registered_capital" ? f.currency(value) : f.number(value)) : displayPrimitive(value);
          return (
            <div key={key} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <dt className="text-muted-foreground">{fieldLabels[key]}</dt>
              <dd className={key === "juristic_id" ? "font-mono text-[13px] tabular-nums" : "tabular-nums"}>{formatted}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
