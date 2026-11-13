import type { Tool, ToolParam } from "@repo/schemas";
import { HOLIDAYS_2026, MOCK_COMPANIES } from "./thai";

type ParamExtra = Omit<ToolParam, "type" | "description">;

function param(type: ToolParam["type"], th: string, en: string, extra: ParamExtra = {}): ToolParam {
  return { type, description: { th, en }, ...extra };
}

const firstCompany = MOCK_COMPANIES[0];
if (!firstCompany) throw new Error("MOCK_COMPANIES must not be empty");

export const TOOL_SEEDS: Tool[] = [
  // ── utils ───────────────────────────────────────────────
  {
    name: "utils.validate_thai_id",
    sourceId: "utils",
    description: {
      th: "ตรวจว่าเลขบัตรประชาชน 13 หลักถูกต้องตามหลักตรวจสอบ (checksum) หรือไม่",
      en: "Check whether a 13-digit Thai citizen ID passes the checksum.",
    },
    inputSchema: {
      type: "object",
      properties: {
        id: param("string", "เลขบัตรประชาชน 13 หลัก", "13-digit citizen ID", {
          pattern: "^[0-9-]{13,17}$",
          format: "thai_id",
        }),
      },
      required: ["id"],
    },
    exampleInput: { id: "1103700012346" },
    exampleOutput: { id: "1103700012346", valid: true, formatted: "1-1037-00012-34-6" },
    cacheTtl: 0,
  },
  {
    name: "utils.validate_tax_id",
    sourceId: "utils",
    description: {
      th: "ตรวจเลขประจำตัวผู้เสียภาษี 13 หลัก และบอกว่าเป็นบุคคลธรรมดาหรือนิติบุคคล",
      en: "Validate a 13-digit taxpayer ID and tell whether it belongs to a person or a juristic entity.",
    },
    inputSchema: {
      type: "object",
      properties: {
        tax_id: param("string", "เลขประจำตัวผู้เสียภาษี 13 หลัก", "13-digit taxpayer ID", {
          pattern: "^[0-9-]{13,17}$",
          format: "thai_id",
        }),
      },
      required: ["tax_id"],
    },
    exampleInput: { tax_id: firstCompany.juristic_id },
    exampleOutput: { tax_id: firstCompany.juristic_id, valid: true, kind: "juristic_person" },
    cacheTtl: 0,
  },
  {
    name: "utils.baht_text",
    sourceId: "utils",
    description: {
      th: "แปลงจำนวนเงินเป็นคำอ่านภาษาไทย สำหรับใบเสร็จและใบกำกับภาษี",
      en: "Spell out an amount in Thai baht text for receipts and tax invoices.",
    },
    inputSchema: {
      type: "object",
      properties: {
        amount: param("number", "จำนวนเงิน (บาท)", "Amount in baht", { minimum: 0 }),
      },
      required: ["amount"],
    },
    exampleInput: { amount: 1250.5 },
    exampleOutput: { amount: 1250.5, text: "หนึ่งพันสองร้อยห้าสิบบาทห้าสิบสตางค์" },
    cacheTtl: 0,
  },
  {
    name: "utils.to_buddhist_date",
    sourceId: "utils",
    description: {
      th: "แปลงวันที่ ค.ศ. เป็น พ.ศ. ทั้งแบบเต็มและแบบย่อ",
      en: "Convert a Gregorian date to the Buddhist calendar in long and short Thai formats.",
    },
    inputSchema: {
      type: "object",
      properties: {
        date: param("string", "วันที่ (YYYY-MM-DD)", "Date (YYYY-MM-DD)", { format: "date" }),
      },
      required: ["date"],
    },
    exampleInput: { date: "2026-11-13" },
    exampleOutput: {
      gregorian: "2026-11-13",
      buddhist_year: 2569,
      thai_long: "13 พฤศจิกายน 2569",
      thai_short: "13 พ.ย. 69",
    },
    cacheTtl: 0,
  },
  {
    name: "utils.promptpay_qr",
    sourceId: "utils",
    description: {
      th: "สร้างข้อความ QR พร้อมเพย์ (EMVCo) จากเบอร์โทรศัพท์หรือเลขผู้เสียภาษี พร้อมระบุจำนวนเงินได้",
      en: "Build a PromptPay (EMVCo) QR payload from a phone number or tax ID, optionally with an amount.",
    },
    inputSchema: {
      type: "object",
      properties: {
        target: param("string", "เบอร์โทรศัพท์หรือเลขผู้เสียภาษี", "Phone number or tax ID", {
          pattern: "^[0-9]{10}$|^[0-9]{13}$",
        }),
        amount: param("number", "จำนวนเงิน (ไม่บังคับ)", "Amount (optional)", { minimum: 0 }),
      },
      required: ["target"],
    },
    exampleInput: { target: "0812345678", amount: 350 },
    exampleOutput: {
      target_type: "phone",
      amount: 350,
      payload: "00020101021229370016A000000677010111011300668123456785802TH530376454063350.006304A1F2",
    },
    cacheTtl: 0,
  },
  // ── tax ─────────────────────────────────────────────────
  {
    name: "tax.calc_vat",
    sourceId: "tax",
    description: {
      th: "คำนวณภาษีมูลค่าเพิ่ม 7% แบบแยกหรือรวม VAT",
      en: "Calculate 7% VAT, either added on top or extracted from a VAT-inclusive amount.",
    },
    inputSchema: {
      type: "object",
      properties: {
        amount: param("number", "จำนวนเงิน (บาท)", "Amount in baht", { minimum: 0 }),
        includes_vat: param("boolean", "จำนวนเงินรวม VAT แล้วหรือไม่", "Whether the amount already includes VAT", {
          default: false,
        }),
      },
      required: ["amount"],
    },
    exampleInput: { amount: 10000, includes_vat: false },
    exampleOutput: { base: 10000, vat: 700, total: 10700, rate: 0.07 },
    cacheTtl: 0,
  },
  {
    name: "tax.calc_withholding_tax",
    sourceId: "tax",
    description: {
      th: "คำนวณภาษีหัก ณ ที่จ่ายตามประเภทเงินได้ เช่น ค่าบริการ ค่าเช่า ค่าโฆษณา",
      en: "Calculate withholding tax by income type such as services, rent or advertising.",
    },
    inputSchema: {
      type: "object",
      properties: {
        amount: param("number", "จำนวนเงินก่อนหัก (บาท)", "Amount before withholding (THB)", { minimum: 0 }),
        income_type: param("string", "ประเภทเงินได้", "Income type", {
          enum: ["service", "rent", "advertising", "transport", "professional"],
        }),
      },
      required: ["amount", "income_type"],
    },
    exampleInput: { amount: 50000, income_type: "service" },
    exampleOutput: { amount: 50000, rate: 0.03, withholding: 1500, net_payment: 48500 },
    cacheTtl: 0,
  },
  {
    name: "tax.calc_personal_income_tax",
    sourceId: "tax",
    description: {
      th: "ประมาณภาษีเงินได้บุคคลธรรมดาทั้งปีตามอัตราขั้นบันได หักค่าใช้จ่ายและค่าลดหย่อนส่วนตัวให้อัตโนมัติ",
      en: "Estimate annual personal income tax with progressive brackets, applying standard expense and personal deductions.",
    },
    inputSchema: {
      type: "object",
      properties: {
        annual_income: param("number", "เงินได้ทั้งปี (บาท)", "Annual income (THB)", { minimum: 0 }),
        other_deductions: param("number", "ค่าลดหย่อนอื่น ๆ (บาท)", "Other deductions (THB)", {
          minimum: 0,
          default: 0,
        }),
      },
      required: ["annual_income"],
    },
    exampleInput: { annual_income: 840000, other_deductions: 0 },
    exampleOutput: {
      annual_income: 840000,
      expense_deduction: 100000,
      personal_allowance: 60000,
      other_deductions: 0,
      net_income: 680000,
      tax: 54500,
      effective_rate: 0.0649,
    },
    cacheTtl: 0,
  },
  // ── electricity ─────────────────────────────────────────
  {
    name: "electricity.calc_electricity_bill",
    sourceId: "electricity",
    description: {
      th: "ประมาณค่าไฟฟ้าบ้านอยู่อาศัย (ประเภท 1.2) จากจำนวนหน่วยที่ใช้",
      en: "Estimate a residential (type 1.2) electricity bill from units used.",
    },
    inputSchema: {
      type: "object",
      properties: {
        units: param("integer", "จำนวนหน่วยที่ใช้ (kWh)", "Units used (kWh)", { minimum: 0 }),
        provider: param("string", "การไฟฟ้า", "Utility", { enum: ["mea", "pea"] }),
      },
      required: ["units", "provider"],
    },
    exampleInput: { units: 320, provider: "mea" },
    exampleOutput: {
      units: 320,
      energy_charge: 1204.97,
      service_charge: 24.62,
      ft_charge: 63.1,
      vat: 90.49,
      total: 1383.18,
    },
    cacheTtl: 86400,
  },
  // ── holidays ────────────────────────────────────────────
  {
    name: "holidays.holidays",
    sourceId: "holidays",
    description: {
      th: "รายการวันหยุดราชการและวันหยุดชดเชยของปีที่ระบุ",
      en: "List public holidays and substitution days for a given year.",
    },
    inputSchema: {
      type: "object",
      properties: {
        year: param("integer", "ปี ค.ศ.", "Gregorian year", { minimum: 2020, maximum: 2030 }),
      },
      required: ["year"],
    },
    exampleInput: { year: 2026 },
    exampleOutput: HOLIDAYS_2026.slice(0, 3).map((h) => ({ ...h })),
    cacheTtl: 86400,
  },
  {
    name: "holidays.is_workday",
    sourceId: "holidays",
    description: {
      th: "ตรวจว่าวันที่ระบุเป็นวันทำการหรือไม่ พร้อมเหตุผลถ้าเป็นวันหยุด",
      en: "Check whether a date is a working day, with the reason if it is not.",
    },
    inputSchema: {
      type: "object",
      properties: {
        date: param("string", "วันที่ (YYYY-MM-DD)", "Date (YYYY-MM-DD)", { format: "date" }),
      },
      required: ["date"],
    },
    exampleInput: { date: "2026-12-07" },
    exampleOutput: { date: "2026-12-07", is_workday: false, reason: "ชดเชยวันพ่อแห่งชาติ" },
    cacheTtl: 86400,
  },
  {
    name: "holidays.add_workdays",
    sourceId: "holidays",
    description: {
      th: "นับวันทำการล่วงหน้าโดยข้ามเสาร์-อาทิตย์และวันหยุดราชการ เช่น คำนวณวันครบกำหนดชำระ",
      en: "Add working days to a date, skipping weekends and public holidays — useful for due dates.",
    },
    inputSchema: {
      type: "object",
      properties: {
        date: param("string", "วันเริ่มต้น (YYYY-MM-DD)", "Start date (YYYY-MM-DD)", { format: "date" }),
        days: param("integer", "จำนวนวันทำการ", "Number of working days", { minimum: 1, maximum: 365 }),
      },
      required: ["date", "days"],
    },
    exampleInput: { date: "2026-12-03", days: 3 },
    exampleOutput: {
      start: "2026-12-03",
      days: 3,
      result: "2026-12-09",
      skipped: ["2026-12-05", "2026-12-06", "2026-12-07"],
    },
    cacheTtl: 86400,
  },
  // ── law ─────────────────────────────────────────────────
  {
    name: "law.search_law",
    sourceId: "law",
    description: {
      th: "ค้นหากฎหมายด้วยคำค้น ได้ชื่อกฎหมาย ประเภท ปีที่ประกาศ และลิงก์เอกสาร",
      en: "Search legislation by keyword: title, type, year of enactment and document link.",
    },
    inputSchema: {
      type: "object",
      properties: {
        query: param("string", "คำค้น", "Search query", { maxLength: 200 }),
        limit: param("integer", "จำนวนผลลัพธ์สูงสุด", "Maximum results", { minimum: 1, maximum: 20, default: 5 }),
      },
      required: ["query"],
    },
    exampleInput: { query: "คุ้มครองข้อมูลส่วนบุคคล", limit: 2 },
    exampleOutput: [
      {
        title: "พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562",
        type: "พระราชบัญญัติ",
        year_be: 2562,
        gazette_ref: "เล่ม 136 ตอนที่ 69 ก",
      },
      {
        title: "ประกาศคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล เรื่อง มาตรการรักษาความมั่นคงปลอดภัย พ.ศ. 2565",
        type: "ประกาศ",
        year_be: 2565,
        gazette_ref: "เล่ม 139 ตอนพิเศษ 145 ง",
      },
    ],
    cacheTtl: 3600,
  },
  {
    name: "law.get_gazette_notice",
    sourceId: "law",
    description: {
      th: "อ่านรายละเอียดประกาศในราชกิจจานุเบกษาจากเลขอ้างอิง",
      en: "Fetch a Royal Gazette notice by reference.",
    },
    inputSchema: {
      type: "object",
      properties: {
        notice_id: param("string", "เลขอ้างอิงประกาศ", "Notice reference", { maxLength: 40 }),
      },
      required: ["notice_id"],
    },
    exampleInput: { notice_id: "2569-A-087-1" },
    exampleOutput: {
      notice_id: "2569-A-087-1",
      title: "พระราชกฤษฎีกาว่าด้วยการลดอัตราภาษีมูลค่าเพิ่ม (ฉบับที่ ...)",
      published_at: "2026-09-29",
      volume: "เล่ม 143 ตอนที่ 87 ก",
      pages: 3,
    },
    cacheTtl: 86400,
  },
  // ── dbd ─────────────────────────────────────────────────
  {
    name: "dbd.company_lookup",
    sourceId: "dbd",
    description: {
      th: "ดูข้อมูลนิติบุคคลจากเลขทะเบียน 13 หลัก ได้ชื่อ สถานะ ทุนจดทะเบียน และที่ตั้ง",
      en: "Look up a juristic person by its 13-digit ID: name, status, registered capital and address.",
    },
    inputSchema: {
      type: "object",
      properties: {
        juristic_id: param("string", "เลขทะเบียนนิติบุคคล 13 หลัก", "13-digit juristic ID", {
          pattern: "^[0-9]{13}$",
          format: "thai_id",
        }),
      },
      required: ["juristic_id"],
    },
    exampleInput: { juristic_id: firstCompany.juristic_id },
    exampleOutput: { ...firstCompany },
    cacheTtl: 3600,
  },
  {
    name: "dbd.company_search",
    sourceId: "dbd",
    description: {
      th: "ค้นหานิติบุคคลด้วยชื่อ (ภาษาไทยหรืออังกฤษ)",
      en: "Search juristic persons by name (Thai or English).",
    },
    inputSchema: {
      type: "object",
      properties: {
        name: param("string", "ชื่อบริษัทหรือบางส่วนของชื่อ", "Company name or part of it", { maxLength: 120 }),
        limit: param("integer", "จำนวนผลลัพธ์สูงสุด", "Maximum results", { minimum: 1, maximum: 20, default: 5 }),
      },
      required: ["name"],
    },
    exampleInput: { name: "โลจิสติกส์", limit: 5 },
    exampleOutput: MOCK_COMPANIES.filter((c) => c.name_th.includes("โลจิสติกส์")).map((c) => ({
      juristic_id: c.juristic_id,
      name_th: c.name_th,
      status: c.status,
    })),
    cacheTtl: 3600,
  },
  // ── datagoth ────────────────────────────────────────────
  {
    name: "datagoth.search_dataset",
    sourceId: "datagoth",
    description: {
      th: "ค้นหาชุดข้อมูลเปิดภาครัฐด้วยคำค้น",
      en: "Search open government datasets by keyword.",
    },
    inputSchema: {
      type: "object",
      properties: {
        query: param("string", "คำค้น", "Search query", { maxLength: 200 }),
        limit: param("integer", "จำนวนผลลัพธ์สูงสุด", "Maximum results", { minimum: 1, maximum: 20, default: 5 }),
      },
      required: ["query"],
    },
    exampleInput: { query: "จำนวนประชากร", limit: 2 },
    exampleOutput: [
      {
        id: "stat-population-province",
        title: "จำนวนประชากรจากการทะเบียน แยกรายจังหวัด",
        organization: "กรมการปกครอง",
        updated_at: "2026-10-01",
        formats: ["CSV", "XLSX"],
      },
      {
        id: "bma-population-district",
        title: "จำนวนประชากรกรุงเทพมหานคร แยกรายเขต",
        organization: "กรุงเทพมหานคร",
        updated_at: "2026-08-15",
        formats: ["CSV"],
      },
    ],
    cacheTtl: 21600,
  },
  {
    name: "datagoth.get_dataset",
    sourceId: "datagoth",
    description: {
      th: "อ่านรายละเอียดชุดข้อมูล ได้คำอธิบาย สัญญาอนุญาต และรายการไฟล์",
      en: "Read dataset details: description, licence and resources.",
    },
    inputSchema: {
      type: "object",
      properties: {
        dataset_id: param("string", "รหัสชุดข้อมูล", "Dataset ID", { maxLength: 120 }),
      },
      required: ["dataset_id"],
    },
    exampleInput: { dataset_id: "stat-population-province" },
    exampleOutput: {
      id: "stat-population-province",
      title: "จำนวนประชากรจากการทะเบียน แยกรายจังหวัด",
      license: "Open Data Common",
      resources: [{ name: "population_2569.csv", format: "CSV", size_kb: 42 }],
    },
    cacheTtl: 21600,
  },
  // ── areas ───────────────────────────────────────────────
  {
    name: "areas.lookup_subdistrict",
    sourceId: "areas",
    description: {
      th: "ค้นหาตำบล/แขวงด้วยชื่อหรือรหัสไปรษณีย์ ได้อำเภอ/เขต จังหวัด และรหัสพื้นที่",
      en: "Find a sub-district by name or postcode, returning district, province and area code.",
    },
    inputSchema: {
      type: "object",
      properties: {
        query: param("string", "ชื่อตำบล/แขวง หรือรหัสไปรษณีย์", "Sub-district name or postcode", {
          maxLength: 80,
        }),
      },
      required: ["query"],
    },
    exampleInput: { query: "คลองเตยเหนือ" },
    exampleOutput: [
      {
        subdistrict: "คลองเตยเหนือ",
        district: "วัฒนา",
        province: "กรุงเทพมหานคร",
        postcode: "10110",
        area_code: "103902",
      },
    ],
    cacheTtl: 604800,
  },
  {
    name: "areas.normalize_address",
    sourceId: "areas",
    description: {
      th: "แยกที่อยู่แบบข้อความอิสระให้เป็นโครงสร้าง เลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์",
      en: "Split a free-text Thai address into house number, road, sub-district, district, province and postcode.",
    },
    inputSchema: {
      type: "object",
      properties: {
        address: param("string", "ที่อยู่แบบข้อความ", "Free-text address", { maxLength: 300 }),
      },
      required: ["address"],
    },
    exampleInput: { address: "99/12 สุขุมวิท คลองเตยเหนือ วัฒนา กทม 10110" },
    exampleOutput: {
      house_no: "99/12",
      road: "ถนนสุขุมวิท",
      subdistrict: "แขวงคลองเตยเหนือ",
      district: "เขตวัฒนา",
      province: "กรุงเทพมหานคร",
      postcode: "10110",
      confidence: 0.94,
    },
    cacheTtl: 604800,
  },
  // ── osm ─────────────────────────────────────────────────
  {
    name: "osm.search_place",
    sourceId: "osm",
    description: {
      th: "ค้นหาสถานที่ใกล้ตำแหน่งที่ระบุ ได้ชื่อ ประเภท พิกัด และระยะทาง",
      en: "Search places near a location: name, type, coordinates and distance.",
    },
    inputSchema: {
      type: "object",
      properties: {
        query: param("string", "สิ่งที่ต้องการค้นหา", "What to search for", { maxLength: 120 }),
        near: param("string", "ใกล้กับ (ชื่อสถานที่หรือย่าน)", "Near (place or area)", { maxLength: 120 }),
        limit: param("integer", "จำนวนผลลัพธ์สูงสุด", "Maximum results", { minimum: 1, maximum: 20, default: 5 }),
      },
      required: ["query"],
    },
    exampleInput: { query: "โรงพยาบาล", near: "อโศก", limit: 2 },
    exampleOutput: [
      { name: "โรงพยาบาลตัวอย่างสุขุมวิท", type: "hospital", lat: 13.7392, lon: 100.5608, distance_m: 650 },
      { name: "คลินิกเวชกรรมอโศก", type: "clinic", lat: 13.7371, lon: 100.5597, distance_m: 420 },
    ],
    cacheTtl: 86400,
  },
  // ── bot (pending permission) ────────────────────────────
  {
    name: "bot.exchange_rate",
    sourceId: "bot",
    description: {
      th: "อัตราแลกเปลี่ยนเงินตราต่างประเทศเฉลี่ยรายวันของธนาคารพาณิชย์",
      en: "Daily average foreign exchange rates of commercial banks.",
    },
    inputSchema: {
      type: "object",
      properties: {
        currency: param("string", "สกุลเงิน", "Currency", { enum: ["USD", "EUR", "JPY", "CNY", "GBP"] }),
        date: param("string", "วันที่ (YYYY-MM-DD)", "Date (YYYY-MM-DD)", { format: "date" }),
      },
      required: ["currency"],
    },
    exampleInput: { currency: "USD", date: "2026-11-12" },
    exampleOutput: { currency: "USD", date: "2026-11-12", buying_transfer: 32.41, selling: 32.88 },
    cacheTtl: 3600,
  },
  {
    name: "bot.policy_rate",
    sourceId: "bot",
    description: {
      th: "อัตราดอกเบี้ยนโยบายล่าสุดและวันที่มีผล",
      en: "Latest policy rate and its effective date.",
    },
    inputSchema: { type: "object", properties: {}, required: [] },
    exampleInput: {},
    exampleOutput: { rate: 1.5, effective_date: "2026-10-22" },
    cacheTtl: 3600,
  },
  {
    name: "bot.bank_holidays",
    sourceId: "bot",
    description: {
      th: "วันหยุดของสถาบันการเงินในปีที่ระบุ",
      en: "Financial institution holidays for a given year.",
    },
    inputSchema: {
      type: "object",
      properties: {
        year: param("integer", "ปี ค.ศ.", "Gregorian year", { minimum: 2020, maximum: 2030 }),
      },
      required: ["year"],
    },
    exampleInput: { year: 2026 },
    exampleOutput: [{ date: "2026-01-01", name_th: "วันขึ้นปีใหม่" }],
    cacheTtl: 86400,
  },
  // ── pcd (pending permission) ────────────────────────────
  {
    name: "pcd.pm25",
    sourceId: "pcd",
    description: {
      th: "ค่า PM2.5 ล่าสุดของจังหวัดหรือสถานีตรวจวัด",
      en: "Latest PM2.5 reading for a province or monitoring station.",
    },
    inputSchema: {
      type: "object",
      properties: {
        province: param("string", "จังหวัด", "Province", { maxLength: 60 }),
      },
      required: ["province"],
    },
    exampleInput: { province: "กรุงเทพมหานคร" },
    exampleOutput: { station: "ริมถนนพระราม 4", pm25: 38, aqi: 96, level: "moderate" },
    cacheTtl: 900,
  },
  {
    name: "pcd.worst_stations",
    sourceId: "pcd",
    description: {
      th: "สถานีที่มีค่า PM2.5 สูงสุดในชั่วโมงล่าสุด",
      en: "Stations with the highest PM2.5 in the latest hour.",
    },
    inputSchema: {
      type: "object",
      properties: {
        limit: param("integer", "จำนวนสถานี", "Number of stations", { minimum: 1, maximum: 20, default: 5 }),
      },
      required: [],
    },
    exampleInput: { limit: 3 },
    exampleOutput: [{ station: "ตัวอย่างสถานี A", province: "เชียงใหม่", pm25: 92 }],
    cacheTtl: 900,
  },
  // ── thaipost (BYOK) ─────────────────────────────────────
  {
    name: "thaipost.track_parcel",
    sourceId: "thaipost",
    description: {
      th: "ติดตามสถานะพัสดุไปรษณีย์ไทยด้วยหมายเลขพัสดุ 13 ตัวอักษร",
      en: "Track a Thailand Post parcel by its 13-character tracking number.",
    },
    inputSchema: {
      type: "object",
      properties: {
        tracking_number: param("string", "หมายเลขพัสดุ เช่น EF123456789TH", "Tracking number, e.g. EF123456789TH", {
          pattern: "^[A-Z]{2}[0-9]{9}TH$",
        }),
      },
      required: ["tracking_number"],
    },
    exampleInput: { tracking_number: "EF582621151TH" },
    exampleOutput: {
      tracking_number: "EF582621151TH",
      status: "นำจ่ายสำเร็จ",
      events: [
        { at: "2026-11-11T09:12:00+07:00", location: "ปณ.บางรัก", description: "รับฝาก" },
        { at: "2026-11-12T06:40:00+07:00", location: "ศป.หลักสี่", description: "อยู่ระหว่างขนส่ง" },
        { at: "2026-11-12T14:05:00+07:00", location: "ปณ.คลองเตย", description: "นำจ่ายสำเร็จ" },
      ],
    },
    cacheTtl: 300,
  },
  // ── line (BYOK) ─────────────────────────────────────────
  {
    name: "line.list_messages",
    sourceId: "line",
    description: {
      th: "อ่านข้อความล่าสุดที่ลูกค้าส่งเข้า LINE OA",
      en: "Read the latest messages customers sent to your LINE OA.",
    },
    inputSchema: {
      type: "object",
      properties: {
        limit: param("integer", "จำนวนข้อความ", "Number of messages", { minimum: 1, maximum: 50, default: 10 }),
      },
      required: [],
    },
    exampleInput: { limit: 2 },
    exampleOutput: [
      { from: "ลูกค้า #1042", text: "สินค้าส่งถึงวันไหนครับ", at: "2026-11-13T10:02:00+07:00" },
      { from: "ลูกค้า #0977", text: "ขอใบกำกับภาษีด้วยค่ะ", at: "2026-11-13T09:47:00+07:00" },
    ],
    cacheTtl: 0,
  },
  {
    name: "line.send_message",
    sourceId: "line",
    description: {
      th: "ส่งข้อความจาก LINE OA ถึงผู้ใช้ที่ระบุ",
      en: "Send a message from your LINE OA to a user.",
    },
    inputSchema: {
      type: "object",
      properties: {
        to: param("string", "LINE user ID ของผู้รับ", "Recipient LINE user ID", { maxLength: 64 }),
        text: param("string", "ข้อความ", "Message text", { maxLength: 500 }),
      },
      required: ["to", "text"],
    },
    exampleInput: { to: "U4af4980629...", text: "พัสดุของคุณจัดส่งแล้ว หมายเลข EF582621151TH" },
    exampleOutput: { sent: true, message_id: "msg_01JC8Z" },
    cacheTtl: 0,
  },
  {
    name: "line.oa_stats",
    sourceId: "line",
    description: {
      th: "สถิติของ LINE OA เช่น จำนวนเพื่อน ข้อความที่ส่ง และอัตราการบล็อก",
      en: "LINE OA statistics such as followers, messages sent and block rate.",
    },
    inputSchema: {
      type: "object",
      properties: {
        date: param("string", "วันที่ (YYYY-MM-DD)", "Date (YYYY-MM-DD)", { format: "date" }),
      },
      required: ["date"],
    },
    exampleInput: { date: "2026-11-12" },
    exampleOutput: { date: "2026-11-12", followers: 4812, messages_sent: 236, block_rate: 0.012 },
    cacheTtl: 3600,
  },
];
