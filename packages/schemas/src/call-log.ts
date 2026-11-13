import { z } from "zod";
import {
  IsoDateSchema,
  IsoDateTimeSchema,
  JsonObjectSchema,
  JsonValueSchema,
  LocalizedTextSchema,
  SortDirectionSchema,
} from "./common";

export const CallClientSchema = z.enum(["claude", "chatgpt", "cursor", "api"]);
export type CallClient = z.infer<typeof CallClientSchema>;

export const CallStatusSchema = z.enum(["success", "error", "rate_limited"]);
export type CallStatus = z.infer<typeof CallStatusSchema>;

export const CallErrorSchema = z.object({
  code: z.string(),
  message: LocalizedTextSchema,
});
export type CallError = z.infer<typeof CallErrorSchema>;

export const CallLogSchema = z.object({
  id: z.string(),
  timestamp: IsoDateTimeSchema,
  tool: z.string(),
  sourceId: z.string(),
  client: CallClientSchema,
  status: CallStatusSchema,
  latencyMs: z.number().int().min(0),
  cached: z.boolean(),
  input: JsonObjectSchema,
  output: JsonValueSchema.optional(),
  error: CallErrorSchema.optional(),
  sourceAttribution: LocalizedTextSchema,
});
export type CallLog = z.infer<typeof CallLogSchema>;

export const LogSortFieldSchema = z.enum(["timestamp", "latencyMs"]);
export type LogSortField = z.infer<typeof LogSortFieldSchema>;

export const LogListParamsSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  from: IsoDateSchema.optional(),
  to: IsoDateSchema.optional(),
  status: CallStatusSchema.optional(),
  sourceId: z.string().optional(),
  client: CallClientSchema.optional(),
  sortBy: LogSortFieldSchema,
  sortDir: SortDirectionSchema,
});
export type LogListParams = z.infer<typeof LogListParamsSchema>;
