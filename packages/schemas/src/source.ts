import { z } from "zod";
import { IsoDateTimeSchema, LocalizedTextSchema } from "./common";
import { PlanIdSchema } from "./plan";

export const SourceCategorySchema = z.enum([
  "utilities",
  "government",
  "business",
  "open_data",
  "geography",
  "finance",
  "environment",
  "logistics",
  "messaging",
]);
export type SourceCategory = z.infer<typeof SourceCategorySchema>;

export const SourceStatusSchema = z.enum(["operational", "degraded", "down"]);
export type SourceStatus = z.infer<typeof SourceStatusSchema>;

export const LicenseStatusSchema = z.enum(["commercial_ok", "pending_permission", "byok"]);
export type LicenseStatus = z.infer<typeof LicenseStatusSchema>;

export const SourceSchema = z.object({
  id: z.string(),
  name: LocalizedTextSchema,
  provider: LocalizedTextSchema,
  category: SourceCategorySchema,
  description: LocalizedTextSchema,
  toolCount: z.number().int().min(0),
  status: SourceStatusSchema,
  /** Whether the current workspace exposes this source's tools to AI clients. */
  enabled: z.boolean(),
  /** BYOK: the workspace must supply its own key for this source. */
  requiresCredential: z.boolean(),
  /** Whether the current workspace has an active credential for this source. */
  credentialConfigured: z.boolean(),
  licenseStatus: LicenseStatusSchema,
  /** How the licence works, or why the source is not yet available. */
  licenseNote: LocalizedTextSchema,
  /** Attribution line every answer from this source carries. */
  attribution: LocalizedTextSchema,
  /** Minimum plan required to enable this source. */
  plan: PlanIdSchema,
  lastCheckedAt: IsoDateTimeSchema,
  officialUrl: z.url(),
});
export type Source = z.infer<typeof SourceSchema>;

export const SourceEnabledFilterSchema = z.enum(["all", "enabled", "disabled"]);
export type SourceEnabledFilter = z.infer<typeof SourceEnabledFilterSchema>;

export const SourceListParamsSchema = z.object({
  search: z.string().optional(),
  category: SourceCategorySchema.optional(),
  enabled: SourceEnabledFilterSchema.optional(),
});
export type SourceListParams = z.infer<typeof SourceListParamsSchema>;

export const SourceStatusPointSchema = z.object({
  timestamp: IsoDateTimeSchema,
  status: SourceStatusSchema,
  avgLatencyMs: z.number().int().min(0),
});
export type SourceStatusPoint = z.infer<typeof SourceStatusPointSchema>;

/** A source can be toggled only when its licence allows it. */
export function isSourceToggleable(source: Pick<Source, "licenseStatus">): boolean {
  return source.licenseStatus !== "pending_permission";
}
