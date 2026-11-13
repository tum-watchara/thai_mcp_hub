import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["th", "en"],
  defaultLocale: "th",
  // Thai lives at "/", English at "/en".
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
