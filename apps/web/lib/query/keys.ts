import type { LogListParams, SourceListParams, ToolListParams } from "@repo/schemas";

/** Hierarchical query keys — invalidate a whole domain with its root key. */
export const queryKeys = {
  demo: {
    tools: () => ["public-demo", "tools"] as const,
  },
  sources: {
    all: ["sources"] as const,
    list: (params: SourceListParams = {}) => ["sources", "list", params] as const,
    detail: (id: string) => ["sources", "detail", id] as const,
    statusHistory: (id: string) => ["sources", "status-history", id] as const,
  },
  tools: {
    all: ["tools"] as const,
    list: (params: ToolListParams = {}) => ["tools", "list", params] as const,
    detail: (name: string) => ["tools", "detail", name] as const,
  },
  logs: {
    all: ["logs"] as const,
    list: (params: LogListParams) => ["logs", "list", params] as const,
    detail: (id: string) => ["logs", "detail", id] as const,
  },
  usage: {
    all: ["usage"] as const,
    summary: () => ["usage", "summary"] as const,
  },
  credentials: {
    all: ["credentials"] as const,
    list: () => ["credentials", "list"] as const,
  },
  team: {
    all: ["team"] as const,
    list: () => ["team", "list"] as const,
  },
  billing: {
    plans: () => ["billing", "plans"] as const,
    invoices: () => ["billing", "invoices"] as const,
  },
  workspace: {
    all: ["workspace"] as const,
    current: () => ["workspace", "current"] as const,
    list: () => ["workspace", "list"] as const,
    user: () => ["workspace", "user"] as const,
    clients: () => ["workspace", "clients"] as const,
    connection: () => ["workspace", "connection"] as const,
  },
} as const;
