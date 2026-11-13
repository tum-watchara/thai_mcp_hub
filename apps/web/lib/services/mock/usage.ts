import type { UsageStat } from "@repo/schemas";
import type { UsageService } from "../types";
import type { MockDb } from "./db";
import { simulate } from "./simulate";

export class MockUsageService implements UsageService {
  constructor(private readonly db: MockDb) {}

  summary(): Promise<UsageStat> {
    return simulate(() => {
      const daily = this.db.daily;
      const totalCalls = daily.reduce((sum, day) => sum + day.calls, 0);
      const totalErrors = daily.reduce((sum, day) => sum + day.errors, 0);
      const successful = this.db.logs.filter((log) => log.status === "success");
      const avgLatencyMs = successful.length
        ? Math.round(successful.reduce((sum, log) => sum + log.latencyMs, 0) / successful.length)
        : 0;
      const plan = this.db.plans.find((p) => p.id === this.db.workspace.planId);
      const first = daily[0];
      const last = daily[daily.length - 1];
      return {
        periodStart: first?.date ?? this.db.now.toISOString().slice(0, 10),
        periodEnd: last?.date ?? this.db.now.toISOString().slice(0, 10),
        totalCalls,
        previousPeriodCalls: Math.round(totalCalls * 0.86),
        successRate: totalCalls > 0 ? 1 - totalErrors / totalCalls : 1,
        avgLatencyMs,
        activeSources: this.db.sources.filter((s) => s.enabled).length,
        quotaUsed: totalCalls,
        quotaLimit: plan?.callsPerMonth ?? 1_000_000,
        daily,
        bySource: this.db.sourceUsage,
      };
    });
  }
}
