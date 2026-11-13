"use client";

import { useTranslations } from "next-intl";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { EmptyState } from "@/components/states";
import { Link } from "@/i18n/navigation";

export function UsageEmptyState() {
  const t = useTranslations("usage.empty");
  return (
    <EmptyState title={t("title")} description={t("description")} compact>
      <Link href="/dashboard/playground" className={buttonVariants({ variant: "secondary", size: "sm" })}>
        {t("action")}
      </Link>
    </EmptyState>
  );
}
