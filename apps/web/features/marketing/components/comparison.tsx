import { useTranslations } from "next-intl";
import { Check, Minus } from "lucide-react";
import { siteConfig } from "@/config/site";
import { MarketingSection } from "./section";

const ROWS = ["source", "timestamp", "batch", "automation", "internal"] as const;

export function Comparison() {
  const t = useTranslations("landing.comparison");
  return (
    <MarketingSection title={t("title")} description={t("description")}>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="w-1/5 px-4 py-3 font-medium">
                {t("aspect")}
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-foreground">
                {t("hub", { product: siteConfig.name })}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {t("web")}
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row}
                className="grid border-b border-border last:border-0 md:table-row"
              >
                <th scope="row" className="px-4 pt-3 text-left font-medium md:py-3.5">
                  {t(`rows.${row}.label`)}
                </th>
                <td className="flex gap-2 px-4 pt-2 md:table-cell md:py-3.5">
                  <Check className="mt-1 size-4 shrink-0 text-success md:hidden" aria-hidden />
                  <span>
                    <span className="sr-only md:hidden">{t("hub", { product: siteConfig.name })}: </span>
                    {t(`rows.${row}.hub`)}
                  </span>
                </td>
                <td className="flex gap-2 px-4 pt-1 pb-3 text-muted-foreground md:table-cell md:py-3.5">
                  <Minus className="mt-1 size-4 shrink-0 md:hidden" aria-hidden />
                  <span>
                    <span className="sr-only md:hidden">{t("web")}: </span>
                    {t(`rows.${row}.web`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MarketingSection>
  );
}
