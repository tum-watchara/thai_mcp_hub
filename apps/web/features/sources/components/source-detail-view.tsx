"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ExternalLink, KeyRound, Play } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton, SkeletonText } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { LicenseBadge, SourceStatusLabel, ToolName } from "@/components/domain/badges";
import { ToolParams } from "@/components/domain/tool-params";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/states";
import { Link } from "@/i18n/navigation";
import { useSourceQuery } from "@/lib/query/sources";
import { useToolsQuery } from "@/lib/query/tools";
import { useWorkspaceQuery } from "@/lib/query/workspace";
import { useFormatters, useLocalized } from "@/lib/utils/format";
import { SourceToggle } from "./source-toggle";
import { StatusHistory } from "./status-history";

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function SourceDetailView({ sourceId }: { sourceId: string }) {
  const t = useTranslations("sourceDetail");
  const tMeta = useTranslations("sourceMeta");
  const tPlans = useTranslations("plans.name");
  const localized = useLocalized();
  const f = useFormatters();
  const sourceQuery = useSourceQuery(sourceId);
  const toolsQuery = useToolsQuery({ sourceId });
  const workspace = useWorkspaceQuery();

  const back = (
    <Link href="/dashboard/sources" className="inline-flex min-h-10 items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:min-h-0">
      <ArrowLeft className="size-4" aria-hidden />
      {t("back")}
    </Link>
  );

  if (sourceQuery.isError) {
    return (
      <>
        {back}
        <ErrorState error={sourceQuery.error} onRetry={() => sourceQuery.refetch()} retrying={sourceQuery.isFetching} />
      </>
    );
  }

  if (sourceQuery.isPending) {
    return (
      <div className="grid gap-6" aria-busy>
        {back}
        <Skeleton className="h-8 w-80" />
        <SkeletonText lines={2} className="max-w-2xl" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const source = sourceQuery.data;

  return (
    <>
      <PageHeader
        eyebrow={back}
        title={localized(source.name)}
        description={localized(source.description)}
        actions={
          <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
            <span className="text-sm">{t("enabledLabel")}</span>
            <SourceToggle source={source} planId={workspace.data?.planId} />
          </div>
        }
      />

      <Card>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Meta label={t("provider")}>{localized(source.provider)}</Meta>
            <Meta label={t("category")}>{tMeta(`category.${source.category}`)}</Meta>
            <Meta label={t("minimumPlan")}>{tPlans(source.plan)}</Meta>
            <Meta label={t("lastChecked", { time: f.relative(source.lastCheckedAt) })}>
              <SourceStatusLabel status={source.status} />
            </Meta>
            <Meta label={t("license")}>
              <span className="grid gap-1">
                <LicenseBadge status={source.licenseStatus} />
                <span className="text-xs text-muted-foreground">{localized(source.licenseNote)}</span>
              </span>
            </Meta>
            <Meta label={t("officialSite")}>
              <a href={source.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                {new URL(source.officialUrl).host}
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </Meta>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("statusHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusHistory sourceId={source.id} />
        </CardContent>
      </Card>

      <div className={cn("grid gap-4", source.requiresCredential && "lg:grid-cols-2")}>
        <Card>
          <CardHeader>
            <CardTitle>{t("attribution")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <p className="rounded-md border border-border bg-subtle px-3 py-2 text-sm">{localized(source.attribution)}</p>
            <p className="text-xs text-muted-foreground">{t("attributionHelp")}</p>
          </CardContent>
        </Card>
        {source.requiresCredential ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("credential.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className={cn("flex gap-2 text-sm", source.credentialConfigured ? "text-foreground" : "text-warning-text")}>
                <KeyRound className="mt-0.5 size-4 shrink-0" aria-hidden />
                {source.credentialConfigured ? t("credential.configured") : t("credential.missing")}
              </p>
              <Link
                href={source.credentialConfigured ? "/dashboard/credentials" : `/dashboard/credentials?add=${source.id}`}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-fit")}
              >
                {source.credentialConfigured ? t("credential.manage") : t("credential.add")}
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">
          {t("tools")} <span className="text-muted-foreground tabular-nums">({source.toolCount})</span>
        </h2>
        {toolsQuery.isError ? (
          <ErrorState error={toolsQuery.error} onRetry={() => toolsQuery.refetch()} retrying={toolsQuery.isFetching} />
        ) : toolsQuery.isPending ? (
          <Skeleton className="h-56 w-full" />
        ) : toolsQuery.data.length === 0 ? (
          <EmptyState title={t("emptyTools.title")} description={t("emptyTools.description")}>
            <Link href="/dashboard/sources" className={buttonVariants({ variant: "secondary", size: "sm" })}>
              {t("back")}
            </Link>
          </EmptyState>
        ) : (
          <div className="grid gap-4">
            {toolsQuery.data.map((tool) => (
              <Card key={tool.name}>
                <CardHeader>
                  <div className="grid gap-1">
                    <ToolName name={tool.name} className="text-sm font-semibold" />
                    <p className="text-sm text-muted-foreground">{localized(tool.description)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {tool.cacheTtl > 0 ? t("cache", { duration: f.duration(tool.cacheTtl) }) : t("noCache")}
                    </span>
                    {source.enabled ? (
                      <Link
                        href={`/dashboard/playground?tool=${encodeURIComponent(tool.name)}`}
                        className={buttonVariants({ variant: "secondary", size: "sm" })}
                      >
                        <Play aria-hidden />
                        {t("tryTool")}
                      </Link>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <ToolParams schema={tool.inputSchema} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
