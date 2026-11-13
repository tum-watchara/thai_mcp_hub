/**
 * Thai-specific helpers used by mock data and computed tools.
 * All IDs produced here pass the official 13-digit checksum but are fabricated.
 */

/** Check digit for 13-digit Thai citizen IDs and juristic/tax IDs (same algorithm). */
export function thaiIdCheckDigit(first12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    sum += Number(first12.charAt(i)) * (13 - i);
  }
  return (11 - (sum % 11)) % 10;
}

export function makeThaiId(first12: string): string {
  if (!/^\d{12}$/.test(first12)) {
    throw new Error(`Expected 12 digits, received "${first12}"`);
  }
  return `${first12}${thaiIdCheckDigit(first12)}`;
}

export function isValidThaiId(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  if (!/^\d{13}$/.test(digits)) return false;
  return thaiIdCheckDigit(digits.slice(0, 12)) === Number(digits.charAt(12));
}

export function formatThaiId(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.length !== 13) return value;
  return `${d.slice(0, 1)}-${d.slice(1, 5)}-${d.slice(5, 10)}-${d.slice(10, 12)}-${d.slice(12)}`;
}

const DIGIT_WORDS = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const UNIT_WORDS = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];

function readBelowMillion(value: number, hasHigherPart: boolean): string {
  if (value === 0) return "";
  const digits = String(value).split("").map(Number);
  const length = digits.length;
  let out = "";
  digits.forEach((digit, index) => {
    const position = length - index - 1;
    if (digit === 0) return;
    if (position === 0 && digit === 1 && (length > 1 || hasHigherPart)) {
      out += "เอ็ด";
    } else if (position === 1 && digit === 2) {
      out += "ยี่";
    } else if (position === 1 && digit === 1) {
      out += "";
    } else {
      out += DIGIT_WORDS[digit] ?? "";
    }
    out += UNIT_WORDS[position] ?? "";
  });
  return out;
}

function readInteger(value: number, hasHigherPart = false): string {
  if (value >= 1_000_000) {
    const millions = Math.floor(value / 1_000_000);
    const rest = value % 1_000_000;
    return `${readInteger(millions)}ล้าน${readBelowMillion(rest, true)}`;
  }
  return readBelowMillion(value, hasHigherPart);
}

/** Converts an amount to Thai baht text, e.g. 1250.5 → "หนึ่งพันสองร้อยห้าสิบบาทห้าสิบสตางค์". */
export function bahtText(amount: number): string {
  const safe = Math.abs(Math.round(amount * 100) / 100);
  let baht = Math.floor(safe);
  let satang = Math.round((safe - baht) * 100);
  if (satang === 100) {
    baht += 1;
    satang = 0;
  }
  const bahtPart = baht > 0 ? `${readInteger(baht)}บาท` : satang > 0 ? "" : "ศูนย์บาท";
  const satangPart = satang > 0 ? `${readInteger(satang)}สตางค์` : "ถ้วน";
  return `${amount < 0 ? "ลบ" : ""}${bahtPart}${satangPart}`;
}

export const THAI_MONTHS_LONG = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export function toBuddhistDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const year = y ?? 1970;
  const month = (m ?? 1) - 1;
  const day = d ?? 1;
  const be = year + 543;
  return {
    gregorian: isoDate,
    buddhist_year: be,
    thai_long: `${day} ${THAI_MONTHS_LONG[month] ?? ""} ${be}`,
    thai_short: `${day} ${THAI_MONTHS_SHORT[month] ?? ""} ${String(be).slice(2)}`,
  };
}

/** Fabricated people — common given names and surnames, no real individuals intended. */
export const THAI_PEOPLE = [
  { name: "สมชาย ใจดี", email: "somchai@siamdigital-acc.example" },
  { name: "สุนิสา วงศ์สวัสดิ์", email: "sunisa@siamdigital-acc.example" },
  { name: "ณัฐพล ศรีสุข", email: "nattapon@siamdigital-acc.example" },
  { name: "พิมพ์ชนก แก้วมณี", email: "pimchanok@siamdigital-acc.example" },
  { name: "ธนากร บุญมา", email: "thanakorn@siamdigital-acc.example" },
  { name: "กมลวรรณ ทองดี", email: "kamonwan@siamdigital-acc.example" },
] as const;

export const BANGKOK_ADDRESSES = [
  "99/12 ถนนสุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร 10110",
  "1788 ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร 10900",
  "55/3 ซอยลาดพร้าว 71 แขวงสะพานสอง เขตวังทองหลาง กรุงเทพมหานคร 10310",
  "214 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310",
  "8/88 ถนนบางนา-ตราด แขวงบางนาใต้ เขตบางนา กรุงเทพมหานคร 10260",
  "321 ถนนสีลม แขวงสุริยวงศ์ เขตบางรัก กรุงเทพมหานคร 10500",
] as const;

export type MockCompany = {
  juristic_id: string;
  name_th: string;
  name_en: string;
  type: string;
  status: string;
  registered_date: string;
  registered_capital: number;
  address: string;
  business_type: string;
}

/** Fabricated companies with checksum-valid juristic IDs. */
export const MOCK_COMPANIES: MockCompany[] = [
  {
    juristic_id: makeThaiId("010556101234"),
    name_th: "บริษัท สยามบัญชีดิจิทัล จำกัด",
    name_en: "Siam Digital Accounting Co., Ltd.",
    type: "บริษัทจำกัด",
    status: "ยังดำเนินกิจการอยู่",
    registered_date: "2018-03-14",
    registered_capital: 5000000,
    address: BANGKOK_ADDRESSES[0],
    business_type: "กิจกรรมด้านบัญชี การทำบัญชีและการตรวจสอบบัญชี",
  },
  {
    juristic_id: makeThaiId("010555803321"),
    name_th: "บริษัท ไทยรุ่งเรืองการผลิต จำกัด",
    name_en: "Thai Rungruang Manufacturing Co., Ltd.",
    type: "บริษัทจำกัด",
    status: "ยังดำเนินกิจการอยู่",
    registered_date: "2015-07-02",
    registered_capital: 20000000,
    address: BANGKOK_ADDRESSES[4],
    business_type: "การผลิตชิ้นส่วนโลหะสำหรับยานยนต์",
  },
  {
    juristic_id: makeThaiId("010556300418"),
    name_th: "บริษัท บางนาโลจิสติกส์ จำกัด",
    name_en: "Bangna Logistics Co., Ltd.",
    type: "บริษัทจำกัด",
    status: "ยังดำเนินกิจการอยู่",
    registered_date: "2020-11-20",
    registered_capital: 3000000,
    address: BANGKOK_ADDRESSES[4],
    business_type: "การขนส่งสินค้าทางถนน",
  },
  {
    juristic_id: makeThaiId("010355902207"),
    name_th: "ห้างหุ้นส่วนจำกัด ศรีสุขพาณิชย์",
    name_en: "Srisuk Panich Limited Partnership",
    type: "ห้างหุ้นส่วนจำกัด",
    status: "ยังดำเนินกิจการอยู่",
    registered_date: "2016-02-09",
    registered_capital: 1000000,
    address: BANGKOK_ADDRESSES[2],
    business_type: "การขายส่งเครื่องใช้ในครัวเรือน",
  },
  {
    juristic_id: makeThaiId("010556405519"),
    name_th: "บริษัท ลาดพร้าวซอฟต์แวร์ จำกัด",
    name_en: "Lat Phrao Software Co., Ltd.",
    type: "บริษัทจำกัด",
    status: "ยังดำเนินกิจการอยู่",
    registered_date: "2021-06-01",
    registered_capital: 2000000,
    address: BANGKOK_ADDRESSES[2],
    business_type: "การเขียนโปรแกรมคอมพิวเตอร์",
  },
  {
    juristic_id: makeThaiId("010555211876"),
    name_th: "บริษัท สีลมการค้าออนไลน์ จำกัด",
    name_en: "Silom Online Trading Co., Ltd.",
    type: "บริษัทจำกัด",
    status: "เลิกกิจการ",
    registered_date: "2012-09-18",
    registered_capital: 1000000,
    address: BANGKOK_ADDRESSES[5],
    business_type: "การขายปลีกทางอินเทอร์เน็ต",
  },
];

export type MockHoliday = {
  date: string;
  name_th: string;
  name_en: string;
}

/** Mock 2026 public holiday calendar (lunar dates are approximate). */
export const HOLIDAYS_2026: MockHoliday[] = [
  { date: "2026-01-01", name_th: "วันขึ้นปีใหม่", name_en: "New Year's Day" },
  { date: "2026-03-03", name_th: "วันมาฆบูชา", name_en: "Makha Bucha Day" },
  { date: "2026-04-06", name_th: "วันจักรี", name_en: "Chakri Memorial Day" },
  { date: "2026-04-13", name_th: "วันสงกรานต์", name_en: "Songkran Festival" },
  { date: "2026-04-14", name_th: "วันสงกรานต์", name_en: "Songkran Festival" },
  { date: "2026-04-15", name_th: "วันสงกรานต์", name_en: "Songkran Festival" },
  { date: "2026-05-01", name_th: "วันแรงงานแห่งชาติ", name_en: "National Labour Day" },
  { date: "2026-05-04", name_th: "วันฉัตรมงคล", name_en: "Coronation Day" },
  { date: "2026-06-01", name_th: "ชดเชยวันวิสาขบูชา", name_en: "Visakha Bucha Day (substitution)" },
  { date: "2026-06-03", name_th: "วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี", name_en: "Queen Suthida's Birthday" },
  { date: "2026-07-28", name_th: "วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว", name_en: "King's Birthday" },
  { date: "2026-07-29", name_th: "วันอาสาฬหบูชา", name_en: "Asarnha Bucha Day" },
  { date: "2026-07-30", name_th: "วันเข้าพรรษา", name_en: "Buddhist Lent Day" },
  { date: "2026-08-12", name_th: "วันแม่แห่งชาติ", name_en: "Mother's Day" },
  { date: "2026-10-13", name_th: "วันนวมินทรมหาราช", name_en: "King Bhumibol Memorial Day" },
  { date: "2026-10-23", name_th: "วันปิยมหาราช", name_en: "Chulalongkorn Day" },
  { date: "2026-12-07", name_th: "ชดเชยวันพ่อแห่งชาติ", name_en: "Father's Day (substitution)" },
  { date: "2026-12-10", name_th: "วันรัฐธรรมนูญ", name_en: "Constitution Day" },
  { date: "2026-12-31", name_th: "วันสิ้นปี", name_en: "New Year's Eve" },
];

export function findHoliday(isoDate: string): MockHoliday | undefined {
  return HOLIDAYS_2026.find((holiday) => holiday.date === isoDate);
}

export function isWeekend(isoDate: string): boolean {
  const day = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}
