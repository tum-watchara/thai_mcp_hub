"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { ShieldQuestion, UserMinus, UserPlus, Users } from "lucide-react";
import { AssignableRoleSchema, type TeamMember } from "@repo/schemas";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { StatusDot } from "@repo/ui/components/status-dot";
import { toast } from "@repo/ui/components/toaster";
import { DataTable, DataTableSkeleton } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/states";
import { useTeamQuery, useUpdateMemberRoleMutation } from "@/lib/query/team";
import { usePlansQuery } from "@/lib/query/usage";
import { useCurrentUserQuery, useWorkspaceQuery } from "@/lib/query/workspace";
import { useFormatters } from "@/lib/utils/format";
import { InviteMemberDialog, RemoveMemberDialog } from "./team-dialogs";

function RoleSelect({ member }: { member: TeamMember }) {
  const t = useTranslations("team");
  const update = useUpdateMemberRoleMutation();
  if (member.role === "owner") return <span>{t("roles.owner")}</span>;
  return (
    <Select
      value={member.role}
      disabled={update.isPending}
      onValueChange={(value) => {
        const role = AssignableRoleSchema.parse(value);
        update.mutate(
          { id: member.id, role },
          {
            onSuccess: () => toast.success(t("toast.roleUpdated", { name: member.name, role: t(`roles.${role}`) })),
            onError: () => toast.error(t("toast.error")),
          },
        );
      }}
    >
      <SelectTrigger className="h-9 w-36 md:h-8" aria-label={t("changeRole", { name: member.name })}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {AssignableRoleSchema.options.map((role) => (
          <SelectItem key={role} value={role}>
            {t(`roles.${role}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TeamView() {
  const t = useTranslations("team");
  const tCommon = useTranslations("common");
  const f = useFormatters();
  const team = useTeamQuery();
  const user = useCurrentUserQuery();
  const workspace = useWorkspaceQuery();
  const plans = usePlansQuery();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const plan = plans.data?.find((p) => p.id === workspace.data?.planId);
  const isYou = (member: TeamMember) => member.email === user.data?.email;

  const memberCell = (member: TeamMember) => (
    <div className="grid min-w-0">
      <span className="flex items-center gap-2 font-medium">
        <span className="truncate">{member.name}</span>
        {isYou(member) ? <Badge tone="outline">{t("you")}</Badge> : null}
      </span>
      <span className="truncate text-xs text-muted-foreground">{member.email}</span>
    </div>
  );

  const removeButton = (member: TeamMember) =>
    member.role === "owner" ? null : (
      <Button variant="ghost" size="sm" onClick={() => setRemoving(member)} aria-label={`${t("remove")} ${member.name}`}>
        <UserMinus aria-hidden />
        <span className="hidden lg:inline">{t("remove")}</span>
      </Button>
    );

  const columns: ColumnDef<TeamMember>[] = [
    { id: "member", header: t("columns.member"), cell: ({ row }) => memberCell(row.original) },
    { id: "role", header: t("columns.role"), cell: ({ row }) => <RoleSelect member={row.original} /> },
    {
      id: "status",
      header: t("columns.status"),
      cell: ({ row }) => (
        <StatusDot tone={row.original.status === "active" ? "success" : "neutral"} label={t(`status.${row.original.status}`)} />
      ),
    },
    {
      id: "lastActive",
      header: t("columns.lastActive"),
      cell: ({ row }) => (row.original.lastActiveAt ? f.relative(row.original.lastActiveAt) : tCommon("none")),
    },
    { id: "actions", header: () => <span className="sr-only">{t("columns.actions")}</span>, cell: ({ row }) => removeButton(row.original) },
  ];

  const table = useReactTable({ data: team.data ?? [], columns, getCoreRowModel: getCoreRowModel(), getRowId: (row) => row.id });

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button variant="primary" onClick={() => setInviteOpen(true)}>
            <UserPlus aria-hidden />
            {t("invite")}
          </Button>
        }
      />

      {team.data && plan?.teamSeats ? (
        <p className="text-sm text-muted-foreground tabular-nums">{t("seats", { used: team.data.length, limit: plan.teamSeats })}</p>
      ) : null}

      {team.isError ? (
        <ErrorState error={team.error} onRetry={() => team.refetch()} retrying={team.isFetching} />
      ) : team.isPending ? (
        <DataTableSkeleton columns={5} rows={5} />
      ) : team.data.length === 0 ? (
        <EmptyState icon={<Users />} title={t("empty.title")} description={t("empty.description")}>
          <Button variant="secondary" size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus aria-hidden />
            {t("invite")}
          </Button>
        </EmptyState>
      ) : (
        <DataTable
          table={table}
          renderMobileRow={(row) => (
            <div className="grid gap-2">
              <div className="flex items-start justify-between gap-2">
                {memberCell(row.original)}
                {removeButton(row.original)}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <RoleSelect member={row.original} />
                <StatusDot
                  tone={row.original.status === "active" ? "success" : "neutral"}
                  label={t(`status.${row.original.status}`)}
                  className="text-xs"
                />
              </div>
            </div>
          )}
        />
      )}

      <Card>
        <CardHeader>
          <div className="grid gap-1">
            <CardTitle className="flex items-center gap-2">
              <ShieldQuestion className="size-4 text-muted-foreground" aria-hidden />
              {t("permissions.title")}
              <Badge tone="outline">{t("permissions.badge")}</Badge>
            </CardTitle>
            <CardDescription>{t("permissions.description")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li>• {t("permissions.example1")}</li>
            <li>• {t("permissions.example2")}</li>
            <li>• {t("permissions.example3")}</li>
          </ul>
        </CardContent>
      </Card>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <RemoveMemberDialog member={removing} onOpenChange={(open) => (open ? undefined : setRemoving(null))} />
    </>
  );
}
