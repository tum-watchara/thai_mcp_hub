"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

export const ONBOARDING_STEPS = ["plugin", "sources", "try"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function OnboardingStepper({ current }: { current: number }) {
  const t = useTranslations("onboarding");
  return (
    <nav aria-label={t("progress", { current: current + 1, total: ONBOARDING_STEPS.length })}>
      <ol className="grid grid-cols-3 gap-2">
        {ONBOARDING_STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step} className="grid gap-2" aria-current={active ? "step" : undefined}>
              <span className={cn("h-1 rounded-full", done || active ? "bg-accent" : "bg-border")} aria-hidden />
              <span className={cn("flex items-center gap-1.5 text-xs md:text-sm", active ? "font-medium text-foreground" : "text-muted-foreground")}>
                {done ? <Check className="size-3.5 text-accent" aria-hidden /> : <span className="font-mono tabular-nums">{index + 1}.</span>}
                <span className="truncate">{t(`steps.${step}`)}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
