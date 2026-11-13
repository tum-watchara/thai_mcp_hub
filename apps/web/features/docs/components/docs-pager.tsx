import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { docHref, type DocPage } from "@/content/docs/manifest";
import { Link } from "@/i18n/navigation";

export function DocsPager({ previous, next }: { previous?: DocPage; next?: DocPage }) {
  const t = useTranslations("docs");
  const locale = useLocale();
  return (
    <nav className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2" aria-label={`${t("previous")} / ${t("next")}`}>
      {previous ? (
        <Link href={docHref(previous)} className="group grid gap-1 rounded-lg border border-border p-4 hover:border-border-strong">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="size-3.5" aria-hidden />
            {t("previous")}
          </span>
          <span className="font-medium group-hover:text-accent">{previous.title[locale]}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={docHref(next)}
          className="group grid gap-1 rounded-lg border border-border p-4 text-right hover:border-border-strong"
        >
          <span className="inline-flex items-center justify-end gap-1 text-xs text-muted-foreground">
            {t("next")}
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
          <span className="font-medium group-hover:text-accent">{next.title[locale]}</span>
        </Link>
      ) : null}
    </nav>
  );
}
