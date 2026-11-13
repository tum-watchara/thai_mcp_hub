import { z } from "zod";
import { IsoDateSchema } from "./common";

export const DailyUsageSchema = z.object({
  date: IsoDateSchema,
  calls: z.number().int().min(0),
  errors: z.number().int().min(0),
});
export type DailyUsage = z.infer<typeof DailyUsageSchema>;

export const SourceUsageSchema = z.object({
  sourceId: z.string(),
  calls: z.number().int().min(0),
});
export type SourceUsage = z.infer<typeof SourceUsageSchema>;

export const UsageStatSchema = z.object({
  periodStart: IsoDateSchema,
  periodEnd: IsoDateSchema,
  totalCalls: z.number().int().min(0),
  previousPeriodCalls: z.number().int().min(0),
  /** 0–1 */
  successRate: z.number().min(0).max(1),
  avgLatencyMs: z.number().int().min(0),
  activeSources: z.number().int().min(0),
  quotaUsed: z.number().int().min(0),
  quotaLimit: z.number().int().min(1),
  daily: z.array(DailyUsageSchema),
  bySource: z.array(SourceUsageSchema),
});
export type UsageStat = z.infer<typeof UsageStatSchema>;

/** Quota bars switch to the warning state at this ratio. */
export const QUOTA_WARNING_RATIO = 0.8;
