import { useTranslations } from "next-intl";
import { ArrowRight, BookOpen, Cloud, GitBranch, Server } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { cn } from "@repo/ui/lib/utils";
import { Link } from "@/i18n/navigation";

const DEPLOYMENT_OPTIONS = [
  { key: "openSource", icon: GitBranch },
  { key: "selfHosted", icon: Server },
  { key: "managedCloud", icon: Cloud },
] as const;

export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section aria-labelledby="hero-title" className="mx-auto w-full max-w-7xl px-4 pt-10 pb-14 sm:px-6 md:pt-16 md:pb-20 lg:px-8 lg:pt-20 lg:pb-24">
      <div className="grid max-w-3xl content-start gap-6">
          <p className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.12em] text-accent uppercase">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            {t("eyebrow")}
          </p>
          <h1 id="hero-title" className="max-w-3xl text-[34px] leading-[1.4] font-semibold tracking-tight text-balance sm:text-[42px] lg:text-[50px] xl:text-[56px]">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-base leading-[1.85] text-muted-foreground sm:text-lg">{t("subtitle")}</p>
          <div className="grid gap-3 pt-1 sm:flex sm:flex-wrap">
            <Link href="/login" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "h-12 gap-3 rounded-lg px-6 text-base shadow-sm")}>
              {t("primaryCta")}<ArrowRight aria-hidden />
            </Link>
            <Link href="/docs" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-12 rounded-lg px-5")}>
              <BookOpen aria-hidden />{t("secondaryCta")}
            </Link>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{t("note")}</p>
          <div className="mt-2 grid gap-4 border-t border-border pt-6">
            <ul className="flex flex-wrap gap-x-5 gap-y-3" aria-label={t("deploymentLabel")}>
              {DEPLOYMENT_OPTIONS.map(({ key, icon: Icon }) => (
                <li key={key} className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon className="size-4 text-muted-foreground" aria-hidden />{t(`deployment.${key}`)}
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">{t("platforms")}</p>
          </div>
      </div>
    </section>
  );
}
