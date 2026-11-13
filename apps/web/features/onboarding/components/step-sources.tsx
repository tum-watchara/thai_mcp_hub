"use client";

import { useTranslations } from "next-intl";
import { isSourceToggleable, planIncludes, type PlanId, type Source } from "@repo/schemas";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { ComingSoonBadge, LicenseBadge } from "@/components/domain/badges";
import { ErrorState } from "@/components/states";
import { useLocalized } from "@/lib/utils/format";

export type SourceAvailability = "available" | "pending" | "needs_credential" | "needs_plan";

export function sourceAvailability(source: Source, planId: PlanId): SourceAvailability {
  if (!isSourceToggleable(source)) return "pending";
  if (!planIncludes(planId, source.plan)) return "needs_plan";
  if (source.requiresCredential && !source.credentialConfigured) return "needs_credential";
  return "available";
}

/** Safe defaults: cleared for commercial use, no key needed, within the plan. */
export function defaultSelection(sources: readonly Source[], planId: PlanId): Set<string> {
  return new Set(
    sources
      .filter((source) => source.licenseStatus === "commercial_ok" && sourceAvailability(source, planId) === "available")
      .map((source) => source.id),
  );
}

interface StepSourcesProps {
  sources: Source[] | undefined;
  planId: PlanId | undefined;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  selected: ReadonlySet<string>;
  onToggle: (id: string, checked: boolean) => void;
}

export function StepSources({ sources, planId, isPending, error, onRetry, selected, onToggle }: StepSourcesProps) {
  const t = useTranslations("onboarding.sources");
  const tPlans = useTranslations("plans.name");
  const tCommon = useTranslations("common");
  const tCategory = useTranslations("sourceMeta.category");
  const localized = useLocalized();

  const toolCount = (sources ?? []).filter((s) => selected.has(s.id)).reduce((sum, s) => sum + s.toolCount, 0);

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : isPending || !sources || !planId ? (
        <div className="grid gap-2" aria-busy>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {t("selected", { count: selected.size, tools: toolCount })}
          </p>
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {sources.map((source) => {
              const availability = sourceAvailability(source, planId);
              const disabled = availability !== "available";
              const id = `onboarding-source-${source.id}`;
              return (
                <li key={source.id} className={cn("flex items-start gap-3 px-4 py-3", disabled && "bg-subtle/60")}>
                  <Checkbox
                    id={id}
                    className="mt-1"
                    checked={selected.has(source.id)}
                    disabled={disabled}
                    onCheckedChange={(checked) => onToggle(source.id, checked === true)}
                    aria-describedby={`${id}-meta`}
                  />
                  <div className="grid min-w-0 flex-1 gap-1">
                    <label htmlFor={id} className={cn("font-medium", disabled ? "text-muted-foreground" : "cursor-pointer")}>
                      {localized(source.name)}
                    </label>
                    <p id={`${id}-meta`} className="text-xs text-muted-foreground">
                      {tCategory(source.category)} · {tCommon("toolCount", { count: source.toolCount })}
                      {availability === "needs_credential" ? ` · ${t("needsCredential")}` : null}
                      {availability === "needs_plan" ? ` · ${t("needsPlan", { plan: tPlans(source.plan) })}` : null}
                      {availability === "pending" ? ` · ${localized(source.licenseNote)}` : null}
                    </p>
                  </div>
                  <div className="hidden shrink-0 sm:block">
                    {availability === "pending" ? <ComingSoonBadge /> : <LicenseBadge status={source.licenseStatus} />}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
