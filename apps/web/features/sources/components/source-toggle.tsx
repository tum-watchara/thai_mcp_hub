"use client";

import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import { isSourceToggleable, planIncludes, type PlanId, type Source } from "@repo/schemas";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Switch } from "@repo/ui/components/switch";
import { toast } from "@repo/ui/components/toaster";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { Link } from "@/i18n/navigation";
import { useToggleSourceMutation } from "@/lib/query/sources";
import { useLocalized } from "@/lib/utils/format";

function DisabledSwitch({ reason, label, checked = false }: { reason: string; label: string; checked?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-accent">
          <Switch checked={checked} disabled aria-label={label} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="left">{reason}</TooltipContent>
    </Tooltip>
  );
}

/**
 * The enable control for one source, covering every state:
 * pending permission, plan-gated, BYOK without a credential, and toggleable.
 */
export function SourceToggle({ source, planId }: { source: Source; planId: PlanId | undefined }) {
  const t = useTranslations("dashboardSources");
  const tPlans = useTranslations("plans.name");
  const localized = useLocalized();
  const toggle = useToggleSourceMutation();
  const name = localized(source.name);
  const label = t("toggleLabel", { name });

  if (!isSourceToggleable(source)) {
    return (
      <div className="flex items-center gap-2">
        <DisabledSwitch reason={localized(source.licenseNote)} label={label} />
        <span className="text-xs text-muted-foreground">{t("comingSoon")}</span>
      </div>
    );
  }

  if (planId && !planIncludes(planId, source.plan)) {
    return <DisabledSwitch reason={t("requiresPlan", { plan: tPlans(source.plan) })} label={label} />;
  }

  if (source.requiresCredential && !source.credentialConfigured) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-warning-text">
          <KeyRound className="size-3.5" aria-hidden />
          {t("needsCredential")}
        </span>
        <Link
          href={`/dashboard/credentials?add=${source.id}`}
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-8")}
          onClick={(event) => event.stopPropagation()}
        >
          {t("addCredential")}
        </Link>
      </div>
    );
  }

  return (
    <Switch
      checked={source.enabled}
      aria-label={label}
      disabled={toggle.isPending && toggle.variables?.id === source.id}
      onClick={(event) => event.stopPropagation()}
      onCheckedChange={(enabled) =>
        toggle.mutate(
          { id: source.id, enabled },
          {
            onSuccess: () => toast.success(enabled ? t("enabledToast", { name }) : t("disabledToast", { name })),
            onError: () => toast.error(t("toggleError", { name })),
          },
        )
      }
    />
  );
}
