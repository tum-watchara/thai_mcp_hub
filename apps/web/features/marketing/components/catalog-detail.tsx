"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Skeleton, SkeletonText } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { LicenseBadge, SourceStatusLabel, ToolName } from "@/components/domain/badges";
import { ToolParams } from "@/components/domain/tool-params";
import { AppCodeBlock } from "@/components/copy-field";
import { PageHeader } from "@/components/page-header";
import { ErrorState } from "@/components/states";
import { Link } from "@/i18n/navigation";
import { useSourceQuery } from "@/lib/query/sources";
import { useToolsQuery } from "@/lib/query/tools";
import { useFormatters, useLocalized } from "@/lib/utils/format";
import { prettyJson } from "@/lib/utils/json";

export function CatalogDetail({ sourceId }: { sourceId: string }) {
  const t = useTranslations("catalog");
  const tMeta = useTranslations("sourceMeta");
  const tPlans = useTranslations("plans");
  const tDetail = useTranslations("sourceDetail");
  const tCommon = useTranslations("common");
  const localized = useLocalized();
  const f = useFormatters();
  const sourceQuery = useSourceQuery(sourceId);
  const toolsQuery = useToolsQuery({ sourceId });

  const back = (
    <Link href="/sources" className="inline-flex min-h-10 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" aria-hidden />
      {t("detail.back")}
    </Link>
  );

  if (sourceQuery.isError) {
    return (
      <div className="grid gap-6">
        {back}
        <ErrorState error={sourceQuery.error} onRetry={() => sourceQuery.refetch()} retrying={sourceQuery.isFetching} />
      </div>
    );
  }

  if (sourceQuery.isPending) {
    return (
      <div className="grid gap-6" aria-busy>
        {back}
        <Skeleton className="h-8 w-2/3" />
        <SkeletonText lines={2} className="max-w-2xl" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const source = sourceQuery.data;
  const pending = source.licenseStatus === "pending_permission";

  return (
    <div className="grid gap-10">
      <PageHeader
        eyebrow={back}
        title={localized(source.name)}
        description={localized(source.description)}
        actions={
          pending ? null : (
            <Link href="/login" className={buttonVariants({ variant: "primary" })}>
              {t("detail.cta")}
            </Link>
          )
        }
      />

      <dl className="grid gap-4 rounded-lg border border-border bg-card p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1">
          <dt className="text-xs text-muted-foreground">{t("provider")}</dt>
          <dd>{localized(source.provider)}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs text-muted-foreground">{tDetail("category")}</dt>
          <dd>{tMeta(`category.${source.category}`)}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs text-muted-foreground">{tDetail("license")}</dt>
          <dd>
            <LicenseBadge status={source.licenseStatus} />
          </dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs text-muted-foreground">{tDetail("minimumPlan")}</dt>
          <dd>{tPlans(`name.${source.plan}`)}</dd>
        </div>
        <div className="grid gap-1 sm:col-span-2">
          <dt className="text-xs text-muted-foreground">{tDetail("lastChecked", { time: f.relative(source.lastCheckedAt) })}</dt>
          <dd>
            <SourceStatusLabel status={source.status} />
          </dd>
        </div>
        <div className="grid gap-1 sm:col-span-2">
          <dt className="text-xs text-muted-foreground">{t("detail.officialSite")}</dt>
          <dd>
            <a href={source.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
              {new URL(source.officialUrl).host}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </dd>
        </div>
      </dl>

      <section className={cn("grid gap-2 rounded-lg border p-5", pending ? "border-warning/40 bg-warning-subtle" : "border-border")}>
        <h2 className={cn("text-sm font-semibold", pending && "text-warning-text")}>
          {pending ? tCommon("comingSoon") : t("detail.licenseNote")}
        </h2>
        <p className={cn("text-sm", pending ? "text-warning-text" : "text-muted-foreground")}>{localized(source.licenseNote)}</p>
        <p className="text-xs text-muted-foreground">{tMeta(`licenseHelp.${source.licenseStatus}`)}</p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-sm font-semibold">{t("detail.attribution")}</h2>
        <p className="rounded-md border border-border bg-subtle px-4 py-3 text-sm">{localized(source.attribution)}</p>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">{t("detail.tools")}</h2>
        {toolsQuery.isError ? (
          <ErrorState error={toolsQuery.error} onRetry={() => toolsQuery.refetch()} retrying={toolsQuery.isFetching} compact />
        ) : toolsQuery.isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="grid gap-6">
            {toolsQuery.data.map((tool) => (
              <article key={tool.name} id={tool.name} className="grid gap-4 rounded-lg border border-border bg-card p-5">
                <header className="grid gap-1">
                  <ToolName name={tool.name} className="text-sm font-semibold" />
                  <p className="text-sm text-muted-foreground">{localized(tool.description)}</p>
                </header>
                <div className="grid gap-2">
                  <h3 className="text-xs font-medium text-muted-foreground">{t("detail.parameters")}</h3>
                  <ToolParams schema={tool.inputSchema} />
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <AppCodeBlock code={prettyJson(tool.exampleInput)} language="json" title={t("detail.input")} maxHeight={280} />
                  <AppCodeBlock code={prettyJson(tool.exampleOutput)} language="json" title={t("detail.output")} maxHeight={280} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
