"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import { UpdateWorkspaceInputSchema, type NotificationSettings, type UpdateWorkspaceInput, type Workspace } from "@repo/schemas";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogConfirm,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Field, fieldDescriptionId, Label } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import { StatusDot } from "@repo/ui/components/status-dot";
import { Switch } from "@repo/ui/components/switch";
import { toast } from "@repo/ui/components/toaster";
import { CopyField } from "@/components/copy-field";
import { useSwitchLocale } from "@/components/locale-switcher";
import { PageHeader } from "@/components/page-header";
import { ProviderIcon } from "@/components/provider-icon";
import { ErrorState } from "@/components/states";
import { routing, type AppLocale } from "@/i18n/routing";
import {
  useRegenerateMcpUrlMutation,
  useUpdateNotificationsMutation,
  useUpdateWorkspaceMutation,
  useWorkspaceQuery,
} from "@/lib/query/workspace";
import { useValidationMessage } from "@/lib/utils/validation";

function Section({ title, description, children, footer, danger }: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  danger?: boolean;
}) {
  return (
    <Card className={danger ? "border-error/40" : undefined}>
      <CardHeader>
        <div className="grid gap-1">
          <CardTitle className={danger ? "text-error-text" : undefined}>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
      {footer ? <CardFooter className="justify-end">{footer}</CardFooter> : null}
    </Card>
  );
}

function WorkspaceNameSection({ workspace }: { workspace: Workspace }) {
  const t = useTranslations("settings.workspace");
  const tCommon = useTranslations("common");
  const message = useValidationMessage();
  const update = useUpdateWorkspaceMutation();
  const form = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(UpdateWorkspaceInputSchema),
    values: { name: workspace.name },
  });
  const error = message(form.formState.errors.name?.message);

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) =>
        update.mutate(values, {
          onSuccess: () => toast.success(t("saved")),
          onError: () => toast.error(tCommon("saveFailed")),
        }),
      )}
    >
      <Section
        title={t("title")}
        footer={
          <Button type="submit" variant="primary" disabled={update.isPending || !form.formState.isDirty}>
            {update.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {update.isPending ? tCommon("saving") : tCommon("save")}
          </Button>
        }
      >
        <Field id="ws-name" label={t("name")} helper={t("nameHelper")} error={error} className="max-w-md">
          <Input id="ws-name" aria-invalid={Boolean(error)} aria-describedby={fieldDescriptionId("ws-name")} {...form.register("name")} />
        </Field>
      </Section>
    </form>
  );
}

function McpUrlSection({ workspace }: { workspace: Workspace }) {
  const t = useTranslations("settings.mcp");
  const tCommon = useTranslations("common");
  const regenerate = useRegenerateMcpUrlMutation();
  const [open, setOpen] = useState(false);

  return (
    <Section title={t("title")} description={t("description")}>
      <details>
        <summary className="min-h-10 cursor-pointer text-sm font-medium text-accent">{t("advanced")}</summary>
        <div className="grid gap-4 pt-3">
          <CopyField value={workspace.mcpUrl} label={t("title")} />
          <div>
            <Button variant="secondary" onClick={() => setOpen(true)}>
              <RefreshCw aria-hidden />
              {t("regenerate")}
            </Button>
          </div>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("dialogTitle")}</AlertDialogTitle>
                <AlertDialogDescription>{t("dialogDescription")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                <AlertDialogConfirm
                  destructive
                  disabled={regenerate.isPending}
                  onClick={() =>
                    regenerate.mutate(undefined, {
                      onSuccess: () => {
                        toast.success(t("regenerated"));
                        setOpen(false);
                      },
                      onError: () => toast.error(tCommon("saveFailed")),
                    })
                  }
                >
                  {regenerate.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
                  {t("confirm")}
                </AlertDialogConfirm>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </details>
    </Section>
  );
}

function LanguageSection() {
  const t = useTranslations("settings.language");
  const tLocale = useTranslations("locale");
  const locale = useLocale();
  const { switchLocale, pending } = useSwitchLocale();
  return (
    <Section title={t("title")} description={t("description")}>
      <Field id="language" label={t("label")} className="max-w-xs">
        <Select value={locale} onValueChange={(value) => switchLocale(value as AppLocale)} disabled={pending}>
          <SelectTrigger id="language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {routing.locales.map((item) => (
              <SelectItem key={item} value={item} lang={item}>
                {tLocale(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </Section>
  );
}

function NotificationsSection({ workspace }: { workspace: Workspace }) {
  const t = useTranslations("settings.notifications");
  const tCommon = useTranslations("common");
  const update = useUpdateNotificationsMutation();
  const { notifications } = workspace;

  const save = (patch: Partial<NotificationSettings>, successMessage = t("saved")) =>
    update.mutate(patch, {
      onSuccess: () => toast.success(successMessage),
      onError: () => toast.error(tCommon("saveFailed")),
    });

  const rows: { key: "errorAlerts" | "quotaAlerts"; helper: string }[] = [
    { key: "errorAlerts", helper: t("errorAlertsHelper") },
    { key: "quotaAlerts", helper: t("quotaAlertsHelper") },
  ];

  return (
    <Section title={t("title")} description={t("description")}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
        <span className="flex items-center gap-2 text-sm">
          <ProviderIcon provider="line" className="size-5" />
          <StatusDot
            tone={notifications.lineConnected ? "success" : "neutral"}
            label={notifications.lineConnected ? t("lineConnected") : t("lineNotConnected")}
          />
        </span>
        {notifications.lineConnected ? null : (
          <Button variant="secondary" size="sm" disabled={update.isPending} onClick={() => save({ lineConnected: true }, t("lineMock"))}>
            {t("connectLine")}
          </Button>
        )}
      </div>
      <ul className="grid gap-4">
        {rows.map((row) => {
          const id = `notify-${row.key}`;
          return (
            <li key={row.key} className="flex items-start justify-between gap-4">
              <div className="grid gap-0.5">
                <Label htmlFor={id}>{t(row.key)}</Label>
                <p id={`${id}-help`} className="text-xs text-muted-foreground">
                  {row.helper}
                </p>
              </div>
              <Switch
                id={id}
                checked={notifications[row.key]}
                disabled={!notifications.lineConnected || update.isPending}
                aria-describedby={`${id}-help`}
                onCheckedChange={(checked) => save(row.key === "errorAlerts" ? { errorAlerts: checked } : { quotaAlerts: checked })}
              />
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function DangerZone({ workspace }: { workspace: Workspace }) {
  const t = useTranslations("settings.danger");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const matches = confirmText.trim() === workspace.name;

  return (
    <Section title={t("title")} danger>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-1">
          <p className="text-sm font-medium">{t("deleteTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("deleteDescription")}</p>
        </div>
        <Button variant="destructive-outline" className="shrink-0" onClick={() => setOpen(true)}>
          <TriangleAlert aria-hidden />
          {t("deleteButton")}
        </Button>
      </div>
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setConfirmText("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialogTitle", { name: workspace.name })}</AlertDialogTitle>
            <AlertDialogDescription>{t("dialogDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <Field
            id="confirm-delete"
            label={t("confirmLabel")}
            error={confirmText && !matches ? tValidation("confirmMismatch") : undefined}
          >
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={workspace.name}
              autoComplete="off"
              aria-invalid={Boolean(confirmText) && !matches}
              aria-describedby={fieldDescriptionId("confirm-delete")}
            />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogConfirm
              destructive
              disabled={!matches}
              onClick={() => {
                toast.message(t("mockToast"));
                setOpen(false);
                setConfirmText("");
              }}
            >
              {t("confirm")}
            </AlertDialogConfirm>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}

export function SettingsView() {
  const t = useTranslations("settings");
  const workspace = useWorkspaceQuery();

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      {workspace.isError ? (
        <ErrorState error={workspace.error} onRetry={() => workspace.refetch()} retrying={workspace.isFetching} />
      ) : workspace.isPending ? (
        <div className="grid max-w-3xl gap-4" aria-busy>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid max-w-3xl gap-6">
          <WorkspaceNameSection workspace={workspace.data} />
          <McpUrlSection workspace={workspace.data} />
          <LanguageSection />
          <NotificationsSection workspace={workspace.data} />
          <DangerZone workspace={workspace.data} />
        </div>
      )}
    </>
  );
}
