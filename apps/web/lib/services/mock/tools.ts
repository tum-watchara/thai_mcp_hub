import { runMockTool } from "@repo/mocks";
import type { RunToolInput, Tool, ToolListParams, ToolRunResult } from "@repo/schemas";
import type { ToolsService } from "../types";
import { createId, type MockDb } from "./db";
import { hydrateSource } from "./sources";
import { notFound, simulate } from "./simulate";

export class MockToolsService implements ToolsService {
  /** Tool+input keys already run in this session, to simulate cache hits. */
  private readonly cache = new Map<string, number>();

  constructor(private readonly db: MockDb) {}

  list(params: ToolListParams = {}): Promise<Tool[]> {
    return simulate(() => {
      const q = (params.search ?? "").trim().toLowerCase();
      const enabledSources = new Set(this.db.sources.filter((s) => s.enabled).map((s) => s.id));
      return this.db.tools
        .filter((tool) => (params.sourceId ? tool.sourceId === params.sourceId : true))
        .filter((tool) => (params.enabledOnly ? enabledSources.has(tool.sourceId) : true))
        .filter((tool) =>
          q
            ? `${tool.name} ${tool.description.th} ${tool.description.en}`.toLowerCase().includes(q)
            : true,
        );
    });
  }

  get(name: string): Promise<Tool> {
    return simulate(() => this.db.tools.find((tool) => tool.name === name) ?? notFound("Tool", name));
  }

  run({ tool: toolName, input, client = "api" }: RunToolInput): Promise<ToolRunResult> {
    return simulate(
      () => {
        const tool = this.db.tools.find((t) => t.name === toolName) ?? notFound("Tool", toolName);
        const seed = this.db.sources.find((s) => s.id === tool.sourceId) ?? notFound("Source", tool.sourceId);
        const source = hydrateSource(this.db, seed);
        const now = new Date();
        const cacheKey = `${toolName}:${JSON.stringify(input)}`;
        const cachedAt = this.cache.get(cacheKey);
        const cached = tool.cacheTtl > 0 && cachedAt !== undefined && now.getTime() - cachedAt < tool.cacheTtl * 1000;

        const base = {
          id: createId("run"),
          tool: toolName,
          sourceId: tool.sourceId,
          input,
          attribution: source.attribution,
          timestamp: now.toISOString(),
          cached,
          latencyMs: cached ? 6 + Math.round(Math.random() * 20) : 90 + Math.round(Math.random() * 600),
        };

        let result: ToolRunResult;
        if (!source.enabled) {
          result = {
            ...base,
            cached: false,
            status: "error",
            error: {
              code: "source_disabled",
              message: {
                th: "แหล่งข้อมูลนี้ปิดอยู่ เปิดใช้ในหน้าแหล่งข้อมูลก่อน",
                en: "This source is turned off. Enable it on the Sources page first.",
              },
            },
          };
        } else if (source.requiresCredential && !source.credentialConfigured) {
          result = {
            ...base,
            cached: false,
            status: "error",
            error: {
              code: "credential_missing",
              message: {
                th: "แหล่งข้อมูลนี้ต้องใช้ credential ของคุณ เพิ่มได้ที่หน้า Credentials",
                en: "This source needs your own credential. Add one on the Credentials page.",
              },
            },
          };
        } else {
          const outcome = runMockTool(toolName, input);
          result = outcome.ok
            ? { ...base, status: "success", output: outcome.output }
            : { ...base, cached: false, status: "error", error: outcome.error };
          if (outcome.ok && !cached && tool.cacheTtl > 0) this.cache.set(cacheKey, now.getTime());
        }

        this.db.logs.unshift({
          id: createId("call"),
          timestamp: result.timestamp,
          tool: result.tool,
          sourceId: result.sourceId,
          client,
          status: result.status,
          latencyMs: result.latencyMs,
          cached: result.cached,
          input: result.input,
          output: result.output,
          error: result.error,
          sourceAttribution: result.attribution,
        });
        // Keep the aggregate dashboard in sync with calls made in the playground.
        const day = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const daily = this.db.daily.find((entry) => entry.date === day);
        if (daily) {
          daily.calls += 1;
          if (result.status !== "success") daily.errors += 1;
        } else {
          this.db.daily.push({ date: day, calls: 1, errors: result.status === "success" ? 0 : 1 });
          this.db.daily = this.db.daily.sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
        }
        const sourceUsage = this.db.sourceUsage.find((entry) => entry.sourceId === result.sourceId);
        if (sourceUsage) sourceUsage.calls += 1;
        else this.db.sourceUsage.push({ sourceId: result.sourceId, calls: 1 });
        return result;
      },
      { kind: "write" },
    );
  }
}
