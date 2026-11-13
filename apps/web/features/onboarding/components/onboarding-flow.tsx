"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { toast } from "@repo/ui/components/toaster";
import { useSetEnabledSourcesMutation, useSourcesQuery } from "@/lib/query/sources";
import { useWorkspaceQuery } from "@/lib/query/workspace";
import { ONBOARDING_STEPS, OnboardingStepper } from "./onboarding-stepper";
import { defaultSelection, StepSources } from "./step-sources";
import { StepTry } from "./step-try";
import { StepPlugin } from "./step-plugin";

export function OnboardingFlow() {
  const t = useTranslations("onboarding");
  const [step, setStep] = useState(0);
  const sources = useSourcesQuery();
  const workspace = useWorkspaceQuery();
  const saveSources = useSetEnabledSourcesMutation();
  const [selection, setSelection] = useState<Set<string> | null>(null);

  const planId = workspace.data?.planId;
  const selected = selection ?? (sources.data && planId ? defaultSelection(sources.data, planId) : new Set<string>());

  const toggle = (id: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelection(next);
  };

  const goNext = () => {
    if (step === 1) {
      saveSources.mutate([...selected], {
        onSuccess: () => {
          toast.success(t("sources.saved"));
          setStep(2);
        },
        onError: () => toast.error(t("sources.saveError")),
      });
      return;
    }
    setStep((current) => Math.min(current + 1, ONBOARDING_STEPS.length - 1));
  };

  const isLast = step === ONBOARDING_STEPS.length - 1;

  return (
    <div className="grid gap-8">
      <OnboardingStepper current={step} />
      <section className="rounded-xl border border-border bg-card p-5 md:p-8">
        {step === 0 ? <StepPlugin /> : null}
        {step === 1 ? (
          <StepSources
            sources={sources.data}
            planId={planId}
            isPending={sources.isPending || workspace.isPending}
            error={sources.error ?? workspace.error}
            onRetry={() => {
              void sources.refetch();
              void workspace.refetch();
            }}
            selected={selected}
            onToggle={toggle}
          />
        ) : null}
        {step === 2 ? <StepTry /> : null}
      </section>
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
          <ArrowLeft aria-hidden />
          {t("back")}
        </Button>
        {isLast ? null : (
          <Button
            variant="primary"
            onClick={goNext}
            disabled={saveSources.isPending || (step === 1 && (sources.isPending || !sources.data))}
          >
            {saveSources.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {step === 1 ? t("saveAndContinue") : t("next")}
            {saveSources.isPending ? null : <ArrowRight aria-hidden />}
          </Button>
        )}
      </div>
    </div>
  );
}
