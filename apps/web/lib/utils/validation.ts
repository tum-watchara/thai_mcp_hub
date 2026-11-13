"use client";

import { useTranslations } from "next-intl";
import type messages from "@/messages/th.json";

type ValidationKey = keyof (typeof messages)["validation"];

const KEYS: readonly ValidationKey[] = [
  "required",
  "invalidEmail",
  "tooShort",
  "tooLong",
  "credentialTooShort",
  "invalidNumber",
  "invalidInteger",
  "min",
  "max",
  "pattern",
  "invalidDate",
  "invalidThaiId",
  "confirmMismatch",
];

function isValidationKey(value: string): value is ValidationKey {
  return (KEYS as readonly string[]).includes(value);
}

/**
 * Turns a schema error message (an i18n key, optionally "key|param") into translated text.
 * Schemas in @repo/schemas emit keys, never display strings.
 */
export function useValidationMessage() {
  const t = useTranslations("validation");
  return (message: string | undefined): string | undefined => {
    if (!message) return undefined;
    const [key = "", param] = message.split("|");
    if (!isValidationKey(key)) return t("pattern");
    if (key === "min") return t("min", { min: param ?? "" });
    if (key === "max") return t("max", { max: param ?? "" });
    return t(key);
  };
}
