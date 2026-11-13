import type { CallLog, LogListParams, Paginated } from "@repo/schemas";
import type { LogsService } from "../types";
import type { MockDb } from "./db";
import { notFound, simulate } from "./simulate";

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Calendar date of a timestamp in Asia/Bangkok, as YYYY-MM-DD. */
function bangkokDate(iso: string): string {
  return new Date(new Date(iso).getTime() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);
}

export class MockLogsService implements LogsService {
  constructor(private readonly db: MockDb) {}

  list(params: LogListParams): Promise<Paginated<CallLog>> {
    return simulate(() => {
      const filtered = this.db.logs.filter((log) => {
        const day = bangkokDate(log.timestamp);
        if (params.from && day < params.from) return false;
        if (params.to && day > params.to) return false;
        if (params.status && log.status !== params.status) return false;
        if (params.sourceId && log.sourceId !== params.sourceId) return false;
        if (params.client && log.client !== params.client) return false;
        return true;
      });

      const direction = params.sortDir === "asc" ? 1 : -1;
      const sorted = [...filtered].sort((a, b) => {
        if (params.sortBy === "latencyMs") return (a.latencyMs - b.latencyMs) * direction;
        return a.timestamp.localeCompare(b.timestamp) * direction;
      });

      const total = sorted.length;
      const pageCount = Math.max(1, Math.ceil(total / params.pageSize));
      const page = Math.min(params.page, pageCount);
      const start = (page - 1) * params.pageSize;
      return {
        items: sorted.slice(start, start + params.pageSize),
        page,
        pageSize: params.pageSize,
        total,
        pageCount,
      };
    });
  }

  get(id: string): Promise<CallLog> {
    return simulate(() => this.db.logs.find((log) => log.id === id) ?? notFound("CallLog", id));
  }
}
