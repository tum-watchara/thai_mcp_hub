import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type messages from "@/messages/th.json";

type MetaKey = Exclude<keyof (typeof messages)["meta"], "description">;

/** Builds a `generateMetadata` that sets the translated page title. */
export function pageMetadata(key: MetaKey) {
  return async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale: raw } = await params;
    const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: "meta" });
    return { title: t(key) };
  };
}
