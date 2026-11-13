import type { JsonObject, JsonValue, ToolError } from "@repo/schemas";
import { round2 } from "./random";
import {
  HOLIDAYS_2026,
  MOCK_COMPANIES,
  bahtText,
  findHoliday,
  formatThaiId,
  isValidThaiId,
  isWeekend,
  toBuddhistDate,
} from "./thai";
import { TOOL_SEEDS } from "./tools";

export type ToolRunOutcome = { ok: true; output: JsonValue } | { ok: false; error: ToolError };

type Runner = (input: JsonObject) => ToolRunOutcome;

function ok(output: JsonValue): ToolRunOutcome {
  return { ok: true, output };
}

function invalid(th: string, en: string): ToolRunOutcome {
  return { ok: false, error: { code: "invalid_input", message: { th, en } } };
}

function str(input: JsonObject, key: string): string {
  const value = input[key];
  return typeof value === "string" ? value.trim() : "";
}

function num(input: JsonObject, key: string, fallback = 0): number {
  const value = input[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const TAX_BRACKETS: readonly (readonly [number, number])[] = [
  [150000, 0],
  [300000, 0.05],
  [500000, 0.1],
  [750000, 0.15],
  [1000000, 0.2],
  [2000000, 0.25],
  [5000000, 0.3],
  [Number.POSITIVE_INFINITY, 0.35],
];

function progressiveTax(netIncome: number): number {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of TAX_BRACKETS) {
    if (netIncome <= lower) break;
    tax += (Math.min(netIncome, upper) - lower) * rate;
    lower = upper;
  }
  return round2(tax);
}

const WITHHOLDING_RATES: Record<string, number> = {
  service: 0.03,
  rent: 0.05,
  advertising: 0.02,
  transport: 0.01,
  professional: 0.03,
};

const RUNNERS: Record<string, Runner> = {
  "utils.validate_thai_id": (input) => {
    const id = str(input, "id").replace(/\D/g, "");
    if (id.length !== 13) return invalid("เลขบัตรต้องมี 13 หลัก", "The ID must have 13 digits");
    return ok({ id, valid: isValidThaiId(id), formatted: formatThaiId(id) });
  },
  "utils.validate_tax_id": (input) => {
    const taxId = str(input, "tax_id").replace(/\D/g, "");
    if (taxId.length !== 13) return invalid("เลขผู้เสียภาษีต้องมี 13 หลัก", "The tax ID must have 13 digits");
    return ok({
      tax_id: taxId,
      valid: isValidThaiId(taxId),
      kind: taxId.startsWith("0") ? "juristic_person" : "individual",
    });
  },
  "utils.baht_text": (input) => {
    const amount = num(input, "amount", Number.NaN);
    if (!Number.isFinite(amount)) return invalid("ต้องระบุจำนวนเงิน", "An amount is required");
    return ok({ amount, text: bahtText(amount) });
  },
  "utils.to_buddhist_date": (input) => {
    const date = str(input, "date");
    if (!isoDatePattern.test(date)) return invalid("รูปแบบวันที่ต้องเป็น YYYY-MM-DD", "Date must be YYYY-MM-DD");
    return ok(toBuddhistDate(date));
  },
  "tax.calc_vat": (input) => {
    const amount = num(input, "amount");
    const includesVat = input.includes_vat === true;
    const base = includesVat ? round2(amount / 1.07) : amount;
    const vat = round2(base * 0.07);
    return ok({ base, vat, total: round2(base + vat), rate: 0.07 });
  },
  "tax.calc_withholding_tax": (input) => {
    const amount = num(input, "amount");
    const rate = WITHHOLDING_RATES[str(input, "income_type")];
    if (rate === undefined) return invalid("ไม่รู้จักประเภทเงินได้นี้", "Unknown income type");
    const withholding = round2(amount * rate);
    return ok({ amount, rate, withholding, net_payment: round2(amount - withholding) });
  },
  "tax.calc_personal_income_tax": (input) => {
    const income = num(input, "annual_income");
    const other = num(input, "other_deductions");
    const expense = Math.min(income * 0.5, 100000);
    const personal = 60000;
    const net = Math.max(0, income - expense - personal - other);
    const tax = progressiveTax(net);
    return ok({
      annual_income: income,
      expense_deduction: expense,
      personal_allowance: personal,
      other_deductions: other,
      net_income: net,
      tax,
      effective_rate: income > 0 ? Math.round((tax / income) * 10000) / 10000 : 0,
    });
  },
  "electricity.calc_electricity_bill": (input) => {
    const units = Math.max(0, Math.round(num(input, "units")));
    const tiers: readonly (readonly [number, number])[] = [
      [150, 3.2484],
      [400, 4.2218],
      [Number.POSITIVE_INFINITY, 4.4217],
    ];
    let energy = 0;
    let lower = 0;
    for (const [upper, rate] of tiers) {
      if (units <= lower) break;
      energy += (Math.min(units, upper) - lower) * rate;
      lower = upper;
    }
    const service = 24.62;
    const ft = round2(units * 0.1972);
    const vat = round2((energy + service + ft) * 0.07);
    return ok({
      units,
      energy_charge: round2(energy),
      service_charge: service,
      ft_charge: ft,
      vat,
      total: round2(energy + service + ft + vat),
    });
  },
  "holidays.holidays": (input) => {
    const year = num(input, "year", 2026);
    if (year !== 2026) {
      return { ok: false, error: { code: "not_found", message: { th: "ยังไม่มีข้อมูลของปีนี้", en: "No data for this year yet" } } };
    }
    return ok(HOLIDAYS_2026.map((h) => ({ ...h })));
  },
  "holidays.is_workday": (input) => {
    const date = str(input, "date");
    if (!isoDatePattern.test(date)) return invalid("รูปแบบวันที่ต้องเป็น YYYY-MM-DD", "Date must be YYYY-MM-DD");
    const holiday = findHoliday(date);
    if (holiday) return ok({ date, is_workday: false, reason: holiday.name_th });
    if (isWeekend(date)) return ok({ date, is_workday: false, reason: "วันเสาร์-อาทิตย์" });
    return ok({ date, is_workday: true, reason: null });
  },
  "holidays.add_workdays": (input) => {
    const start = str(input, "date");
    const days = Math.max(1, Math.round(num(input, "days", 1)));
    if (!isoDatePattern.test(start)) return invalid("รูปแบบวันที่ต้องเป็น YYYY-MM-DD", "Date must be YYYY-MM-DD");
    const skipped: string[] = [];
    let cursor = start;
    let counted = 0;
    while (counted < days) {
      cursor = addDaysIso(cursor, 1);
      if (isWeekend(cursor) || findHoliday(cursor)) {
        skipped.push(cursor);
      } else {
        counted += 1;
      }
    }
    return ok({ start, days, result: cursor, skipped });
  },
  "dbd.company_lookup": (input) => {
    const id = str(input, "juristic_id");
    if (!isValidThaiId(id)) {
      return invalid("เลขทะเบียนนิติบุคคลไม่ถูกต้อง (checksum ไม่ผ่าน)", "Invalid juristic ID (checksum failed)");
    }
    const company = MOCK_COMPANIES.find((c) => c.juristic_id === id);
    if (!company) {
      return {
        ok: false,
        error: {
          code: "not_found",
          message: { th: "ไม่พบนิติบุคคลที่ใช้เลขนี้", en: "No juristic person uses this ID" },
        },
      };
    }
    return ok({ ...company });
  },
  "dbd.company_search": (input) => {
    const name = str(input, "name").toLowerCase();
    const limit = num(input, "limit", 5);
    const results = MOCK_COMPANIES.filter(
      (c) => c.name_th.toLowerCase().includes(name) || c.name_en.toLowerCase().includes(name),
    )
      .slice(0, limit)
      .map((c) => ({ juristic_id: c.juristic_id, name_th: c.name_th, status: c.status }));
    return ok(results);
  },
};

/** Runs a tool against mock data. Tools without a dedicated runner return their example output. */
export function runMockTool(toolName: string, input: JsonObject): ToolRunOutcome {
  const tool = TOOL_SEEDS.find((t) => t.name === toolName);
  if (!tool) {
    return { ok: false, error: { code: "not_found", message: { th: "ไม่พบ tool นี้", en: "Tool not found" } } };
  }
  for (const key of tool.inputSchema.required) {
    const value = input[key];
    if (value === undefined || value === null || value === "") {
      return invalid(`ต้องระบุ ${key}`, `${key} is required`);
    }
  }
  const runner = RUNNERS[toolName];
  return runner ? runner(input) : ok(tool.exampleOutput);
}
