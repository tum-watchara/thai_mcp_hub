"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { ProviderIcon } from "@/components/provider-icon";
import { siteConfig } from "@/config/site";
import { Link, useRouter } from "@/i18n/navigation";

type Provider = "line" | "google";

/** Mock sign-in: no real auth in this phase — both buttons continue to onboarding. */
export function LoginCard() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, setPending] = useState<Provider | null>(null);

  const signIn = (provider: Provider) => {
    setPending(provider);
    router.push("/onboarding");
  };

  return (
    <div className="grid w-full max-w-md gap-4">
      <Card>
        <CardContent className="grid gap-6 md:p-8">
          <div className="grid gap-2">
            <h1 className="text-2xl font-semibold">{t("title", { product: siteConfig.name })}</h1>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>
          <div className="grid gap-3">
            <Button size="lg" variant="secondary" className="w-full justify-start gap-3" onClick={() => signIn("line")} disabled={pending !== null}>
              <ProviderIcon provider="line" />
              <span className="flex-1 text-left">{t("line")}</span>
              {pending === "line" ? <Loader2 className="animate-spin" aria-hidden /> : null}
            </Button>
            <Button size="lg" variant="secondary" className="w-full justify-start gap-3" onClick={() => signIn("google")} disabled={pending !== null}>
              <ProviderIcon provider="google" />
              <span className="flex-1 text-left">{t("google")}</span>
              {pending === "google" ? <Loader2 className="animate-spin" aria-hidden /> : null}
            </Button>
            <p className="min-h-5 text-xs text-muted-foreground" aria-live="polite">
              {pending ? t("redirecting") : null}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.rich("terms", {
              terms: (chunks) => (
                <a href={siteConfig.links.terms} className="text-accent hover:underline" target="_blank" rel="noreferrer">
                  {chunks}
                </a>
              ),
              privacy: (chunks) => (
                <a href={siteConfig.links.privacy} className="text-accent hover:underline" target="_blank" rel="noreferrer">
                  {chunks}
                </a>
              ),
            })}
          </p>
        </CardContent>
      </Card>
      <p className="rounded-md border border-dashed border-border-strong bg-background px-3 py-2 text-xs text-muted-foreground">
        {t("mockNotice")}
      </p>
      <Link href="/" className="inline-flex min-h-10 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        {t("backHome")}
      </Link>
    </div>
  );
}
