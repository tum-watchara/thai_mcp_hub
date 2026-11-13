"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Skeleton } from "@repo/ui/components/skeleton";
import { LicenseBadge } from "@/components/domain/badges";
import { ErrorState } from "@/components/states";
import { Link } from "@/i18n/navigation";
import { useSourcesQuery } from "@/lib/query/sources";
import { useLocalized } from "@/lib/utils/format";
import { MarketingSection } from "./section";

export function LandingSources() {
  const t = useTranslations("landing.sources");
  const tCategory = useTranslations("sourceMeta.category");
  const tCommon = useTranslations("common");
  const localized = useLocalized();
  const query = useSourcesQuery();

  return (
    <MarketingSection
      title={t("title")}
      description={t("description")}
      subtle
      actions={
        <Link href="/sources" className={buttonVariants({ variant: "secondary" })}>
          {t("viewAll")}
          <ArrowRight aria-hidden />
        </Link>
      }
    >
      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
                  {t("columns.category")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("columns.source")}
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">
                  {t("columns.tools")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("columns.license")}
                </th>
              </tr>
            </thead>
            <tbody>
              {query.isPending
                ? Array.from({ length: 8 }, (_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="hidden px-4 py-3.5 md:table-cell">
                        <Skeleton className="h-3.5 w-20" />
                      </td>
                      <td className="px-4 py-3.5">
                        <Skeleton className="h-3.5 w-48" />
                      </td>
                      <td className="hidden px-4 py-3.5 sm:table-cell">
                        <Skeleton className="h-3.5 w-10" />
                      </td>
                      <td className="px-4 py-3.5">
                        <Skeleton className="h-5 w-24" />
                      </td>
                    </tr>
                  ))
                : query.data.map((source) => (
                    <tr key={source.id} className="border-b border-border last:border-0 hover:bg-subtle">
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {tCategory(source.category)}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/sources/${source.id}`} className="font-medium hover:text-accent">
                          {localized(source.name)}
                        </Link>
                        <span className="block text-xs text-muted-foreground md:hidden">
                          {tCategory(source.category)} · {tCommon("toolCount", { count: source.toolCount })}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 tabular-nums sm:table-cell">{source.toolCount}</td>
                      <td className="px-4 py-3">
                        <LicenseBadge status={source.licenseStatus} />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </MarketingSection>
  );
}
