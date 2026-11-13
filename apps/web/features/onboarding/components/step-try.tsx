"use client";

import { useTranslations } from "next-intl";
import { CircleCheck, Loader2 } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { CopyField } from "@/components/copy-field";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { useConnectionCheckQuery } from "@/lib/query/workspace";

export function StepTry() {
  const t = useTranslations("onboarding.try");
  const tClients = useTranslations("clients");
  const connection = useConnectionCheckQuery(true);
  const detected = connection.data?.detected === true;
  const question = t("question", { id: siteConfig.sampleJuristicId });

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <CopyField value={question} label={t("title")} mono={false} />

      <div
        className={
          detected
            ? "grid gap-3 rounded-lg border border-success/30 bg-success-subtle p-5"
            : "grid gap-2 rounded-lg border border-dashed border-border-strong bg-card p-5"
        }
        role="status"
        aria-live="polite"
      >
        {detected ? (
          <>
            <p className="flex items-center gap-2 font-semibold text-success-text">
              <CircleCheck className="size-5" aria-hidden />
              {t("detected")}
            </p>
            <p className="text-sm">
              {t("detectedDescription", { client: tClients(connection.data?.client ?? "claude") })}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/dashboard" className={buttonVariants({ variant: "primary" })}>
                {t("goDashboard")}
              </Link>
              <Link href="/dashboard/playground" className={buttonVariants({ variant: "secondary" })}>
                {t("openPlayground")}
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 text-sm font-medium">
              <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
              {t("waiting")}
            </p>
            <p className="text-sm text-muted-foreground">{t("waitingHint")}</p>
          </>
        )}
      </div>
    </div>
  );
}
