import { z } from "zod";
import type { JsonObject, ToolInputSchema, ToolParam } from "@repo/schemas";

/** Form state: text inputs hold strings, checkboxes hold booleans. */
export type ToolFormValues = Record<string, string | boolean>;

/*
 * Validation messages are i18n keys under `validation.*`.
 * Parameterised keys are encoded as "key|value" (e.g. "min|0") and decoded by useValidationMessage().
 */

function stringField(param: ToolParam, required: boolean): z.ZodType<string> {
  let base = z.string().trim();
  if (param.maxLength !== undefined) base = base.max(param.maxLength, { error: "tooLong" });
  return base.superRefine((value, ctx) => {
    if (value === "") {
      if (required) ctx.addIssue({ code: "custom", message: "required" });
      return;
    }
    if (param.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      ctx.addIssue({ code: "custom", message: "invalidDate" });
      return;
    }
    if (param.enum && !param.enum.includes(value)) {
      ctx.addIssue({ code: "custom", message: "pattern" });
      return;
    }
    if (param.pattern && !new RegExp(param.pattern).test(value)) {
      ctx.addIssue({ code: "custom", message: "pattern" });
    }
  });
}

function numberField(param: ToolParam, required: boolean): z.ZodType<string> {
  return z.string().superRefine((raw, ctx) => {
    const value = raw.trim();
    if (value === "") {
      if (required) ctx.addIssue({ code: "custom", message: "required" });
      return;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      ctx.addIssue({ code: "custom", message: "invalidNumber" });
      return;
    }
    if (param.type === "integer" && !Number.isInteger(parsed)) {
      ctx.addIssue({ code: "custom", message: "invalidInteger" });
      return;
    }
    if (param.minimum !== undefined && parsed < param.minimum) {
      ctx.addIssue({ code: "custom", message: `min|${param.minimum}` });
    }
    if (param.maximum !== undefined && parsed > param.maximum) {
      ctx.addIssue({ code: "custom", message: `max|${param.maximum}` });
    }
  });
}

/** Builds a Zod schema for the generated form from a tool's JSON-schema-like input definition. */
export function buildFormSchema(schema: ToolInputSchema): z.ZodType<ToolFormValues, ToolFormValues> {
  const shape: Record<string, z.ZodType<string | boolean>> = {};
  for (const [name, param] of Object.entries(schema.properties)) {
    const required = schema.required.includes(name);
    if (param.type === "boolean") shape[name] = z.boolean();
    else if (param.type === "number" || param.type === "integer") shape[name] = numberField(param, required);
    else shape[name] = stringField(param, required);
  }
  return z.object(shape) as unknown as z.ZodType<ToolFormValues, ToolFormValues>;
}

/** JSON input → form values (numbers become strings for text inputs). */
export function toFormValues(schema: ToolInputSchema, input: JsonObject): ToolFormValues {
  const values: ToolFormValues = {};
  for (const [name, param] of Object.entries(schema.properties)) {
    const raw = input[name] ?? param.default;
    if (param.type === "boolean") values[name] = raw === true;
    else values[name] = raw === undefined || raw === null ? "" : String(raw);
  }
  return values;
}

/** Form values → tool input. Empty optional fields are omitted. */
export function toToolInput(schema: ToolInputSchema, values: ToolFormValues): JsonObject {
  const input: JsonObject = {};
  for (const [name, param] of Object.entries(schema.properties)) {
    const value = values[name];
    if (param.type === "boolean") {
      input[name] = value === true;
      continue;
    }
    if (typeof value !== "string" || value.trim() === "") continue;
    input[name] = param.type === "number" || param.type === "integer" ? Number(value) : value.trim();
  }
  return input;
}
