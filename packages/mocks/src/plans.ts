import type { Invoice, Plan } from "@repo/schemas";
import { addDays, toIsoDate } from "./random";

export const PLAN_SEEDS: Plan[] = [
  {
    id: "free",
    priceMonthlyThb: 0,
    callsPerMonth: 1000,
    rateLimitPerMinute: 20,
    teamSeats: 1,
    logRetentionDays: 7,
    support: "community",
    features: ["computed_sources", "playground", "call_logs"],
    recommended: false,
  },
  {
    id: "starter",
    priceMonthlyThb: 490,
    callsPerMonth: 10000,
    rateLimitPerMinute: 60,
    teamSeats: 3,
    logRetentionDays: 30,
    support: "email",
    features: ["computed_sources", "public_sources", "byok_sources", "playground", "call_logs", "line_alerts"],
    recommended: false,
  },
  {
    id: "pro",
    priceMonthlyThb: 2490,
    callsPerMonth: 50000,
    rateLimitPerMinute: 300,
    teamSeats: 10,
    logRetentionDays: 90,
    support: "priority",
    features: [
      "computed_sources",
      "public_sources",
      "byok_sources",
      "playground",
      "call_logs",
      "line_alerts",
      "team",
    ],
    recommended: true,
  },
  {
    id: "enterprise",
    priceMonthlyThb: null,
    callsPerMonth: null,
    rateLimitPerMinute: null,
    teamSeats: null,
    logRetentionDays: 365,
    support: "dedicated",
    features: [
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
    ],
    recommended: false,
  },
];

export function createInvoices(now: Date): Invoice[] {
  const invoices: Invoice[] = [];
  for (let i = 0; i < 6; i += 1) {
    const periodEnd = addDays(now, -30 * i - 1);
    const periodStart = addDays(periodEnd, -29);
    const isPro = i < 3;
    invoices.push({
      id: `inv_${String(6 - i).padStart(3, "0")}`,
      number: `INV-2569-${String(1040 - i * 7).padStart(5, "0")}`,
      issuedAt: addDays(periodEnd, 1).toISOString(),
      periodStart: toIsoDate(periodStart),
      periodEnd: toIsoDate(periodEnd),
      planId: isPro ? "pro" : "starter",
      amountThb: isPro ? 2664.3 : 524.3,
      status: i === 0 ? "open" : "paid",
    });
  }
  return invoices;
}
