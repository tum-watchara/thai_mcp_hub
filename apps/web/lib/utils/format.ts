"use client";

import { useFormatter, useLocale, useNow, useTranslations } from "next-intl";
import type { LocalizedText } from "@repo/schemas";

/** Picks the current locale's text from a `{ th, en }` pair. */
export function useLocalized() {
  const locale = useLocale();
  return (text: LocalizedText): string => text[locale];
}

/**
 * Locale-aware formatting (Thai uses the Buddhist calendar and Thai month names).
 * All numbers render with tabular figures via the `tabular-nums` class at the call site.
 */
export function useFormatters() {
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });
  const tDuration = useTranslations("common.duration");

  return {
    number: (value: number) => format.number(value),
    compact: (value: number) => format.number(value, { notation: "compact", maximumFractionDigits: 1 }),
    percent: (ratio: number, digits = 1) =>
      format.number(ratio, { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits }),
    signedPercent: (ratio: number) =>
      format.number(ratio, { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }),
    currency: (value: number) =>
      format.number(value, { style: "currency", currency: "THB", maximumFractionDigits: 2 }),
    date: (iso: string) => format.dateTime(new Date(iso), { day: "numeric", month: "short", year: "numeric" }),
    shortDate: (iso: string) => format.dateTime(new Date(iso), { day: "numeric", month: "short" }),
    dateTime: (iso: string) =>
      format.dateTime(new Date(iso), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    time: (iso: string) => format.dateTime(new Date(iso), { hour: "2-digit", minute: "2-digit" }),
    timeWithSeconds: (iso: string) =>
      format.dateTime(new Date(iso), { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    relative: (iso: string) => format.relativeTime(new Date(iso), now),
    /** Human cache duration, e.g. 3600 → "1 ชั่วโมง". */
    duration: (seconds: number) => {
      if (seconds % 86400 === 0) return tDuration("days", { count: seconds / 86400 });
      if (seconds % 3600 === 0) return tDuration("hours", { count: seconds / 3600 });
      if (seconds % 60 === 0) return tDuration("minutes", { count: seconds / 60 });
      return tDuration("seconds", { count: seconds });
    },
  };
}

export type Formatters = ReturnType<typeof useFormatters>;
