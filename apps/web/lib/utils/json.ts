import type { JsonValue } from "@repo/schemas";

export function prettyJson(value: JsonValue | undefined): string {
  return JSON.stringify(value ?? null, null, 2);
}

export function isJsonObject(value: JsonValue | undefined): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Renders a primitive JSON value for display in key/value lists. */
export function displayPrimitive(value: JsonValue): string {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
