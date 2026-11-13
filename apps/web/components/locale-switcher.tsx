"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

export function useSwitchLocale() {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  return {
    pending,
    switchLocale: (locale: AppLocale) =>
      startTransition(() => {
        const search = typeof window === "undefined" ? "" : window.location.search;
        router.replace(`${pathname}${search}`, { locale });
      }),
  };
}

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("locale");
  const locale = useLocale();
  const { switchLocale, pending } = useSwitchLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={compact ? "icon" : "sm"} aria-label={t("switch")} disabled={pending}>
          <Languages aria-hidden />
          {compact ? null : <span className="uppercase">{locale}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>{t("switch")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={locale} onValueChange={(value) => switchLocale(value as AppLocale)}>
          {routing.locales.map((item) => (
            <DropdownMenuRadioItem key={item} value={item} lang={item}>
              {t(item)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
