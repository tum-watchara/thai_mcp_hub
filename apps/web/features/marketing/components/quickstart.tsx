"use client";

import { useTranslations } from "next-intl";
import { ClientSetupTabs } from "@/features/onboarding/components/client-setup-tabs";
import { MarketingSection } from "./section";

const STEPS = ["one", "two", "three"] as const;

export function Quickstart() {
  const t = useTranslations("landing.steps");
  return (
    <MarketingSection title={t("title")} description={t("description")}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <ol className="grid content-start gap-6">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-4">
              <span
                aria-hidden
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong font-mono text-sm"
              >
                {index + 1}
              </span>
              <div className="grid gap-1">
                <h3 className="text-base font-semibold">{t(`${step}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`${step}.description`)}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="min-w-0 rounded-lg border border-border bg-card p-4 md:p-5">
          <ClientSetupTabs />
        </div>
      </div>
    </MarketingSection>
  );
}
