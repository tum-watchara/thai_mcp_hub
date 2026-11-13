"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ErrorState } from "@/components/states";
import { useWorkspaceQuery } from "@/lib/query/workspace";
import { ClientSetupTabs } from "./client-setup-tabs";

export function StepPlugin() {
  const t = useTranslations("onboarding.plugin");
  const workspace = useWorkspaceQuery();

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      {workspace.isError ? (
        <ErrorState error={workspace.error} onRetry={() => workspace.refetch()} retrying={workspace.isFetching} />
      ) : workspace.isPending ? (
        <div className="grid gap-4" aria-busy>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="grid gap-2">
          <p className="text-sm font-medium">{t("chooseClient")}</p>
          <ClientSetupTabs workspaceName={workspace.data.name} />
        </div>
      )}
    </div>
  );
}
