export const LOG_RANGES = ["today", "d7", "d30", "all"] as const;
export type LogRange = (typeof LOG_RANGES)[number];

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

function bangkokDate(date: Date): string {
  return new Date(date.getTime() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);
}

/** Converts a preset range into an inclusive `from` date (Asia/Bangkok calendar days). */
export function rangeToFrom(range: LogRange, now: Date = new Date()): string | undefined {
  if (range === "all") return undefined;
  const days = range === "today" ? 0 : range === "d7" ? 6 : 29;
  return bangkokDate(new Date(now.getTime() - days * 24 * 60 * 60 * 1000));
}
