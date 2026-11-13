"use client";

import { useCallback, useEffect, useState } from "react";
import { ToolRunResultSchema, type ToolRunResult } from "@repo/schemas";
import { z } from "zod";

const STORAGE_KEY = "playground:history";
const MAX_ENTRIES = 10;
const HistorySchema = z.array(ToolRunResultSchema);

function read(): ToolRunResult[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = HistorySchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function write(entries: ToolRunResult[]): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage may be unavailable (private mode); history then lives in memory only.
  }
}

/** Last 10 playground runs, kept in sessionStorage for this tab. */
export function useRunHistory() {
  const [entries, setEntries] = useState<ToolRunResult[]>([]);

  useEffect(() => {
    setEntries(read());
  }, []);

  const add = useCallback((result: ToolRunResult) => {
    setEntries((current) => {
      const next = [result, ...current.filter((entry) => entry.id !== result.id)].slice(0, MAX_ENTRIES);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    write([]);
  }, []);

  return { entries, add, clear };
}
