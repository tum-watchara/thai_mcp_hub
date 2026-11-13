import { z } from "zod";
import { IsoDateTimeSchema, JsonObjectSchema, JsonValueSchema, LocalizedTextSchema } from "./common";
import { CallClientSchema } from "./call-log";

export const ToolParamTypeSchema = z.enum(["string", "number", "integer", "boolean"]);
export type ToolParamType = z.infer<typeof ToolParamTypeSchema>;

/** JSON-schema-like description of one input parameter, used for display and form generation. */
export const ToolParamSchema = z.object({
  type: ToolParamTypeSchema,
  description: LocalizedTextSchema,
  enum: z.array(z.string()).optional(),
  pattern: z.string().optional(),
  format: z.enum(["date", "thai_id"]).optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  maxLength: z.number().int().optional(),
  default: z.union([z.string(), z.number(), z.boolean()]).optional(),
});
export type ToolParam = z.infer<typeof ToolParamSchema>;

export const ToolInputSchemaSchema = z.object({
  type: z.literal("object"),
  properties: z.record(z.string(), ToolParamSchema),
  required: z.array(z.string()),
});
export type ToolInputSchema = z.infer<typeof ToolInputSchemaSchema>;

export const ToolSchema = z.object({
  /** Fully-qualified tool name, e.g. `dbd.company_lookup`. */
  name: z.string().regex(/^[a-z0-9_]+\.[a-z0-9_]+$/),
  sourceId: z.string(),
  description: LocalizedTextSchema,
  inputSchema: ToolInputSchemaSchema,
  exampleInput: JsonObjectSchema,
  exampleOutput: JsonValueSchema,
  /** Seconds a result stays cached. 0 = never cached. */
  cacheTtl: z.number().int().min(0),
});
export type Tool = z.infer<typeof ToolSchema>;

export const ToolListParamsSchema = z.object({
  sourceId: z.string().optional(),
  search: z.string().optional(),
  enabledOnly: z.boolean().optional(),
});
export type ToolListParams = z.infer<typeof ToolListParamsSchema>;

export const RunToolInputSchema = z.object({
  tool: z.string(),
  input: JsonObjectSchema,
  client: CallClientSchema.optional(),
});
export type RunToolInput = z.infer<typeof RunToolInputSchema>;

export const ToolErrorCodeSchema = z.enum([
  "invalid_input",
  "not_found",
  "upstream_error",
  "rate_limited",
  "credential_missing",
  "source_disabled",
]);
export type ToolErrorCode = z.infer<typeof ToolErrorCodeSchema>;

export const ToolErrorSchema = z.object({
  code: ToolErrorCodeSchema,
  message: LocalizedTextSchema,
});
export type ToolError = z.infer<typeof ToolErrorSchema>;

export const ToolRunResultSchema = z.object({
  id: z.string(),
  tool: z.string(),
  sourceId: z.string(),
  input: JsonObjectSchema,
  status: z.enum(["success", "error"]),
  output: JsonValueSchema.optional(),
  error: ToolErrorSchema.optional(),
  latencyMs: z.number().int().min(0),
  cached: z.boolean(),
  attribution: LocalizedTextSchema,
  timestamp: IsoDateTimeSchema,
});
export type ToolRunResult = z.infer<typeof ToolRunResultSchema>;
