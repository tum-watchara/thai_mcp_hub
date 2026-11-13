"use client";

import { useTranslations } from "next-intl";
import { MessageSquareText } from "lucide-react";
import { CopyField } from "@/components/copy-field";
import { EmptyState } from "@/components/states";
import { siteConfig } from "@/config/site";

/** "No calls yet" with a concrete question the user can paste into Claude. */
export function LogsEmptyState({ compact }: { compact?: boolean }) {
  const t = useTranslations("logs.empty");
  const question = t("question", { id: siteConfig.sampleJuristicId });
  return (
    <EmptyState icon={<MessageSquareText />} title={t("title")} description={t("description")} compact={compact}>
      <CopyField value={question} label={t("title")} mono={false} className="w-full max-w-lg" />
    </EmptyState>
  );
}
