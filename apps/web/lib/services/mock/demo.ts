import { TOOL_SEEDS, runMockTool } from "@repo/mocks";
import type { RunToolInput, Tool, ToolRunResult } from "@repo/schemas";
import type { DemoService } from "../types";
import { createId } from "./db";
import { notFound, simulate } from "./simulate";

const DEMO_TOOLS = ["dbd.company_lookup", "utils.baht_text", "holidays.is_workday"] as const;

/** No MockDb reference: public demos cannot change workspace settings or metering. */
export class MockDemoService implements DemoService {
  list(): Promise<Tool[]> {
    return simulate(() => DEMO_TOOLS.map((name) => TOOL_SEEDS.find((tool) => tool.name === name) ?? notFound("DemoTool", name)), { reliable: true });
  }

  run({ tool: name, input }: RunToolInput): Promise<ToolRunResult> {
    const startedAt = Date.now();
    return simulate<ToolRunResult>(() => {
      const allowed = DEMO_TOOLS.some((tool) => tool === name);
      const tool = allowed ? TOOL_SEEDS.find((entry) => entry.name === name) : undefined;
      if (!tool) return notFound("DemoTool", name);
      const outcome = runMockTool(name, input);
      const base = {
        id: createId("demo"), tool: name, sourceId: tool.sourceId, input,
        latencyMs: Math.max(0, Date.now() - startedAt), cached: false,
        timestamp: new Date().toISOString(),
        attribution: {
          th: "ข้อมูลตัวอย่างที่สร้างใน sandbox ไม่ได้เรียก API ภายนอก",
          en: "Sample data generated in the sandbox. No external API was called.",
        },
      };
      return outcome.ok
        ? { ...base, status: "success", output: outcome.output }
        : { ...base, status: "error", error: outcome.error };
    }, { reliable: true, minLatency: 450, maxLatency: 800 });
  }
}
