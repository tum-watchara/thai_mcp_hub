import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { siteConfig } from "@/config/site";

export function OpenSourceCallout() {
  const t = useTranslations("landing.openSource");
  return (
    <section className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="grid max-w-2xl gap-2">
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <a href={siteConfig.links.github} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary" })}>
          {t("cta")}
          <ExternalLink aria-hidden />
        </a>
      </div>
    </section>
  );
}
