import type { CallClient, CallLog, CallStatus, DailyUsage, JsonObject, SourceStatusPoint, SourceUsage } from "@repo/schemas";
import { addDays, createRng, pick, pickWeighted, randomInt, toIsoDate } from "./random";
import { runMockTool } from "./runners";
import { SOURCE_SEEDS } from "./sources";
import { BANGKOK_ADDRESSES, MOCK_COMPANIES, makeThaiId } from "./thai";
import { TOOL_SEEDS } from "./tools";

/** Realistic sample inputs per tool, used to synthesise call history. */
const SAMPLE_INPUTS: Record<string, JsonObject[]> = {
  "utils.validate_thai_id": [
    { id: makeThaiId("110370001234") },
    { id: makeThaiId("310090045671") },
    { id: "1103700012345" },
    { id: makeThaiId("170990012388") },
  ],
  "utils.validate_tax_id": MOCK_COMPANIES.map((c) => ({ tax_id: c.juristic_id })),
  "utils.baht_text": [{ amount: 1250.5 }, { amount: 48500 }, { amount: 107000 }, { amount: 2664.3 }, { amount: 21 }],
  "utils.to_buddhist_date": [{ date: "2026-11-13" }, { date: "2026-12-31" }, { date: "2026-10-01" }],
  "utils.promptpay_qr": [{ target: "0812345678", amount: 350 }, { target: "0899998888", amount: 1290 }],
  "tax.calc_vat": [
    { amount: 10000, includes_vat: false },
    { amount: 53500, includes_vat: true },
    { amount: 2490, includes_vat: false },
  ],
  "tax.calc_withholding_tax": [
    { amount: 50000, income_type: "service" },
    { amount: 25000, income_type: "rent" },
    { amount: 120000, income_type: "advertising" },
  ],
  "tax.calc_personal_income_tax": [
    { annual_income: 840000, other_deductions: 0 },
    { annual_income: 480000, other_deductions: 30000 },
    { annual_income: 1500000, other_deductions: 100000 },
  ],
  "holidays.holidays": [{ year: 2026 }],
  "holidays.is_workday": [{ date: "2026-12-07" }, { date: "2026-11-16" }, { date: "2026-12-10" }],
  "holidays.add_workdays": [
    { date: "2026-12-03", days: 3 },
    { date: "2026-11-13", days: 30 },
    { date: "2026-12-25", days: 5 },
  ],
  "law.search_law": [{ query: "คุ้มครองข้อมูลส่วนบุคคล", limit: 5 }, { query: "ภาษีมูลค่าเพิ่ม", limit: 3 }],
  "dbd.company_lookup": [
    ...MOCK_COMPANIES.map((c) => ({ juristic_id: c.juristic_id })),
    { juristic_id: makeThaiId("010556999999") },
  ],
  "dbd.company_search": [{ name: "โลจิสติกส์", limit: 5 }, { name: "ซอฟต์แวร์", limit: 5 }, { name: "Siam", limit: 3 }],
  "areas.lookup_subdistrict": [{ query: "คลองเตยเหนือ" }, { query: "10900" }, { query: "สะพานสอง" }],
  "areas.normalize_address": BANGKOK_ADDRESSES.map((address) => ({ address })),
  "thaipost.track_parcel": [
    { tracking_number: "EF582621151TH" },
    { tracking_number: "RB104938271TH" },
    { tracking_number: "EM773920154TH" },
  ],
  "datagoth.search_dataset": [{ query: "จำนวนประชากร", limit: 5 }],
};

const TOOL_WEIGHTS: readonly (readonly [string, number])[] = [
  ["dbd.company_lookup", 18],
  ["utils.validate_tax_id", 10],
  ["utils.baht_text", 9],
  ["tax.calc_vat", 9],
  ["tax.calc_withholding_tax", 7],
  ["holidays.add_workdays", 7],
  ["holidays.is_workday", 6],
  ["areas.normalize_address", 6],
  ["utils.validate_thai_id", 5],
  ["dbd.company_search", 5],
  ["thaipost.track_parcel", 5],
  ["areas.lookup_subdistrict", 4],
  ["utils.to_buddhist_date", 3],
  ["tax.calc_personal_income_tax", 3],
  ["law.search_law", 2],
  ["holidays.holidays", 2],
  ["utils.promptpay_qr", 2],
  ["datagoth.search_dataset", 1],
];

const CLIENT_WEIGHTS: readonly (readonly [CallClient, number])[] = [
  ["claude", 50],
  ["cursor", 20],
  ["chatgpt", 20],
  ["api", 10],
];

function attributionFor(sourceId: string) {
  const source = SOURCE_SEEDS.find((s) => s.id === sourceId);
  return source ? { ...source.attribution } : { th: "", en: "" };
}

export function createCallLogs(now: Date, count = 200): CallLog[] {
  const rng = createRng(20261113);
  const logs: CallLog[] = [];
  for (let i = 0; i < count; i += 1) {
    const toolName = pickWeighted(rng, TOOL_WEIGHTS);
    const tool = TOOL_SEEDS.find((t) => t.name === toolName);
    if (!tool) continue;
    const inputs = SAMPLE_INPUTS[toolName] ?? [tool.exampleInput];
    const input = pick(rng, inputs);
    // Skew towards recent activity: square of a uniform number.
    const minutesBack = Math.floor(rng() ** 2 * 30 * 24 * 60);
    const timestamp = new Date(now.getTime() - minutesBack * 60_000 - randomInt(rng, 0, 59) * 1000);
    const roll = rng();
    let status: CallStatus = roll < 0.03 ? "rate_limited" : "success";
    const outcome = runMockTool(toolName, input);
    if (!outcome.ok) status = "error";
    if (status === "success" && roll > 0.975) status = "error";
    const cached = status === "success" && tool.cacheTtl > 0 && rng() < 0.45;
    const latencyMs = cached ? randomInt(rng, 4, 35) : status === "rate_limited" ? randomInt(rng, 3, 12) : randomInt(rng, 60, 1150);

    const base = {
      id: `call_${String(count - i).padStart(5, "0")}_${Math.floor(rng() * 1e6).toString(36)}`,
      timestamp: timestamp.toISOString(),
      tool: toolName,
      sourceId: tool.sourceId,
      client: pickWeighted(rng, CLIENT_WEIGHTS),
      latencyMs,
      cached,
      input,
      sourceAttribution: attributionFor(tool.sourceId),
    };

    if (status === "rate_limited") {
      logs.push({
        ...base,
        status,
        error: {
          code: "rate_limited",
          message: {
            th: "เรียกใช้เกิน 300 ครั้งต่อนาทีตามแพ็กเกจ ระบบจะรับคำขอใหม่ในไม่กี่วินาที",
            en: "Exceeded the plan limit of 300 calls per minute. New requests are accepted within seconds.",
          },
        },
      });
    } else if (status === "error") {
      logs.push({
        ...base,
        status,
        error: outcome.ok
          ? {
              code: "upstream_error",
              message: {
                th: "แหล่งข้อมูลต้นทางตอบช้าเกิน 10 วินาที ระบบยกเลิกคำขอ",
                en: "The upstream source took longer than 10 seconds; the request was cancelled.",
              },
            }
          : { code: outcome.error.code, message: outcome.error.message },
      });
    } else if (outcome.ok) {
      logs.push({ ...base, status, output: outcome.output });
    }
  }
  return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** 30 days of daily totals, ending today. */
export function createDailyUsage(now: Date): DailyUsage[] {
  const rng = createRng(4120);
  const days: DailyUsage[] = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = addDays(now, -offset);
    const weekday = date.getUTCDay();
    const base = weekday === 0 || weekday === 6 ? 620 : 1560;
    const trend = 1 + (29 - offset) * 0.008;
    const calls = Math.round(base * trend * (0.85 + rng() * 0.3));
    const errors = Math.round(calls * (0.02 + rng() * 0.035));
    days.push({ date: toIsoDate(date), calls, errors });
  }
  return days;
}

const SOURCE_SHARE: readonly (readonly [string, number])[] = [
  ["dbd", 0.27],
  ["utils", 0.24],
  ["tax", 0.17],
  ["holidays", 0.12],
  ["areas", 0.09],
  ["thaipost", 0.07],
  ["law", 0.03],
  ["datagoth", 0.01],
];

export function createSourceUsage(totalCalls: number): SourceUsage[] {
  let remaining = totalCalls;
  return SOURCE_SHARE.map(([sourceId, share], index) => {
    // Assign the rounding remainder to the last row so the breakdown sums to the total.
    const calls = index === SOURCE_SHARE.length - 1 ? remaining : Math.min(remaining, Math.round(totalCalls * share));
    remaining -= calls;
    return { sourceId, calls };
  });
}

/** Hourly status for the last 24 hours. */
export function createStatusHistory(now: Date, sourceId: string, current: SourceStatusPoint["status"]): SourceStatusPoint[] {
  const rng = createRng(sourceId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0));
  const points: SourceStatusPoint[] = [];
  for (let hour = 23; hour >= 0; hour -= 1) {
    const timestamp = new Date(now.getTime() - hour * 3_600_000);
    timestamp.setUTCMinutes(0, 0, 0);
    let status: SourceStatusPoint["status"] = "operational";
    if (hour === 0) status = current;
    else if (current === "degraded" && hour < 5 && rng() < 0.6) status = "degraded";
    else if (rng() < 0.03) status = "degraded";
    const avgLatencyMs = status === "operational" ? randomInt(rng, 80, 320) : randomInt(rng, 900, 2400);
    points.push({ timestamp: timestamp.toISOString(), status, avgLatencyMs });
  }
  return points;
}
