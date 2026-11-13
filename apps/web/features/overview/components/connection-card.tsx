"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { StatusDot } from "@repo/ui/components/status-dot";
import { ErrorState } from "@/components/states";
import { Link } from "@/i18n/navigation";
import { useConnectedClientsQuery, useWorkspaceQuery } from "@/lib/query/workspace";
import { useFormatters } from "@/lib/utils/format";
import { ClientSetupTabs } from "@/features/onboarding/components/client-setup-tabs";

const RECENT_MS = 15 * 60 * 1000;

export function ConnectionCard() {
  const t = useTranslations("overview.connection");
  const tClients = useTranslations("clients");
  const f = useFormatters();
  const workspace = useWorkspaceQuery();
  const clients = useConnectedClientsQuery();

  return (
    <Card>
      <CardHeader>
        <div className="grid gap-1">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </div>
        <Link href="/docs/quickstart" className="inline-flex min-h-10 items-center gap-1 text-sm text-accent hover:underline md:min-h-0">
          {t("howTo")}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </CardHeader>
      <CardContent className="grid gap-5">
        {workspace.isError ? (
          <ErrorState error={workspace.error} onRetry={() => workspace.refetch()} retrying={workspace.isFetching} compact />
        ) : workspace.isPending ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <ClientSetupTabs workspaceName={workspace.data.name} />
        )}

        <div className="grid gap-2">
          <p className="text-xs font-medium text-muted-foreground">{t("clients")}</p>
          {clients.isError ? (
            <ErrorState error={clients.error} onRetry={() => clients.refetch()} retrying={clients.isFetching} compact />
          ) : clients.isPending ? (
            <div className="grid gap-2">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-56" />
            </div>
          ) : clients.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noClients")}</p>
          ) : (
            <ul className="grid gap-2">
              {clients.data.map((client) => {
                const recent = Date.now() - new Date(client.lastSeenAt).getTime() < RECENT_MS;
                return (
                  <li key={client.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
                    <StatusDot tone={recent ? "success" : "neutral"} label={client.label} />
                    <span className="text-xs text-muted-foreground">
                      {tClients(client.client)} · {t("lastSeen", { time: f.relative(client.lastSeenAt) })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
