import { useLocale, useTranslations } from "next-intl";
import { Brand } from "@/components/brand";
import { footerNav, siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";

export function MarketingFooter() {
  const t = useTranslations("nav.footer");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div className="grid max-w-md gap-2">
          <Brand />
          <p className="text-sm text-muted-foreground">{siteConfig.tagline[locale]}</p>
          <p className="text-xs text-muted-foreground">{tCommon("mockNotice")}</p>
        </div>
        <nav aria-label={t("docs")}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {footerNav.map((item) => (
              <li key={item.labelKey}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center text-muted-foreground hover:text-foreground"
                  >
                    {t(item.labelKey)}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="inline-flex min-h-10 items-center text-muted-foreground hover:text-foreground"
                  >
                    {t(item.labelKey)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
