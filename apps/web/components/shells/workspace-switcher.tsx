"use client";

import { useTranslations } from "next-intl";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Skeleton } from "@repo/ui/components/skeleton";
import { toast } from "@repo/ui/components/toaster";
import { useWorkspaceQuery, useWorkspacesQuery } from "@/lib/query/workspace";

export function WorkspaceSwitcher() {
  const t = useTranslations("shell");
  const tPlans = useTranslations("plans.name");
  const current = useWorkspaceQuery();
  const list = useWorkspacesQuery();

  if (current.isPending) return <Skeleton className="h-8 w-36" />;
  const name = current.data?.name ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="max-w-52 justify-between gap-2 px-2" aria-label={t("switchWorkspace")}>
          <span className="truncate font-medium">{name}</span>
          <ChevronsUpDown className="text-muted-foreground" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{t("workspaces")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={current.data?.id}
          onValueChange={(id) => {
            const target = list.data?.find((workspace) => workspace.id === id);
            if (target && id !== current.data?.id) toast.message(t("workspaceSwitched", { name: target.name }));
          }}
        >
          {(list.data ?? []).map((workspace) => (
            <DropdownMenuRadioItem key={workspace.id} value={workspace.id}>
              <span className="grid min-w-0">
                <span className="truncate">{workspace.name}</span>
                <span className="text-xs text-muted-foreground">{tPlans(workspace.planId)}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
