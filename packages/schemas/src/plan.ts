import { z } from "zod";
import { IsoDateSchema, IsoDateTimeSchema } from "./common";

export const PlanIdSchema = z.enum(["free", "starter", "pro", "enterprise"]);
export type PlanId = z.infer<typeof PlanIdSchema>;

/** Ordered from lowest to highest so plans can be compared by index. */
export const PLAN_ORDER: readonly PlanId[] = PlanIdSchema.options;

export const PlanFeatureSchema = z.enum([
  "computed_sources",
  "public_sources",
  "byok_sources",
  "playground",
  "call_logs",
  "line_alerts",
  "team",
  "internal_systems",
  "sla",
  "dedicated_support",
]);
export type PlanFeature = z.infer<typeof PlanFeatureSchema>;

export const SupportLevelSchema = z.enum(["community", "email", "priority", "dedicated"]);
export type SupportLevel = z.infer<typeof SupportLevelSchema>;

export const PlanSchema = z.object({
  id: PlanIdSchema,
  /** Monthly price in THB, excluding VAT. null = custom pricing. */
  priceMonthlyThb: z.number().int().min(0).nullable(),
  /** Calls per month. null = negotiated. */
  callsPerMonth: z.number().int().min(0).nullable(),
  rateLimitPerMinute: z.number().int().min(1).nullable(),
  teamSeats: z.number().int().min(1).nullable(),
  logRetentionDays: z.number().int().min(1),
  support: SupportLevelSchema,
  features: z.array(PlanFeatureSchema),
  recommended: z.boolean(),
});
export type Plan = z.infer<typeof PlanSchema>;

export const InvoiceStatusSchema = z.enum(["paid", "open", "void"]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const InvoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  issuedAt: IsoDateTimeSchema,
  periodStart: IsoDateSchema,
  periodEnd: IsoDateSchema,
  planId: PlanIdSchema,
  amountThb: z.number().min(0),
  status: InvoiceStatusSchema,
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export function planRank(plan: PlanId): number {
  return PLAN_ORDER.indexOf(plan);
}

export function planIncludes(current: PlanId, required: PlanId): boolean {
  return planRank(current) >= planRank(required);
}
