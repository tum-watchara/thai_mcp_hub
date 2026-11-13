"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, SearchX } from "lucide-react";
import type { SourceCategory } from "@repo/schemas";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ComingSoonBadge, LicenseBadge } from "@/components/domain/badges";
import { CategorySelect, SearchInput } from "@/components/domain/source-filters";
import { EmptyState, ErrorState } from "@/components/states";
import { Link } from "@/i18n/navigation";
import { useSourcesQuery } from "@/lib/query/sources";
import { useLocalized } from "@/lib/utils/format";
import { useDebouncedValue } from "@/lib/utils/use-debounced-value";

export function CatalogList() {
  const t = useTranslations("catalog");
  const tMeta = useTranslations("sourceMeta");
  const tCommon = useTranslations("common");
  const localized = useLocalized();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SourceCategory | undefined>();
  const debouncedSearch = useDebouncedValue(search);
  const query = useSourcesQuery({ search: debouncedSearch || undefined, category });

  const clear = () => {
    setSearch("");
    setCategory(undefined);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder={t("searchPlaceholder")} className="sm:max-w-sm sm:flex-1" />
        <CategorySelect value={category} onChange={setCategory} label={tMeta("allCategories")} className="sm:w-56" />
        {query.data ? (
          <p className="text-sm text-muted-foreground sm:ml-auto" aria-live="polite">
            {t("resultCount", { count: query.data.length })}
          </p>
        ) : null}
      </div>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} />
      ) : query.isPending ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : query.data.length === 0 ? (
        <EmptyState icon={<SearchX />} title={t("emptyFiltered.title")} description={t("emptyFiltered.description")}>
          <Button variant="secondary" size="sm" onClick={clear}>
            {t("emptyFiltered.action")}
          </Button>
        </EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {query.data.map((source) => (
            <li key={source.id}>
              <Link
                href={`/sources/${source.id}`}
                className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-border-strong hover:bg-subtle"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-0.5">
                    <h2 className="font-semibold group-hover:text-accent">{localized(source.name)}</h2>
                    <p className="text-xs text-muted-foreground">
                      {tMeta(`category.${source.category}`)} · {localized(source.provider)}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{localized(source.description)}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  <LicenseBadge status={source.licenseStatus} />
                  {source.licenseStatus === "pending_permission" ? <ComingSoonBadge /> : null}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {tCommon("toolCount", { count: source.toolCount })}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
