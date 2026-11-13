import {
  OTHER_WORKSPACES,
  PLAN_SEEDS,
  SOURCE_SEEDS,
  TOOL_SEEDS,
  createCallLogs,
  createConnectedClients,
  createCredentials,
  createCurrentUser,
  createDailyUsage,
  createSourceUsage,
  createInvoices,
  createTeamMembers,
  createWorkspace,
  type SourceSeed,
} from "@repo/mocks";
import type {
  CallLog,
  ConnectedClient,
  Credential,
  DailyUsage,
  Invoice,
  Plan,
  PluginClient,
  SourceUsage,
  TeamMember,
  Tool,
  User,
  Workspace,
  WorkspaceSummary,
} from "@repo/schemas";
import { siteConfig } from "@/config/site";

/**
 * In-memory "server state" shared by all mock services for one browser session.
 * Mutations (toggles, credentials, invites) persist until the page is reloaded.
 */
export interface MockDb {
  now: Date;
  sources: SourceSeed[];
  sourceCheckedAt: Map<string, string>;
  tools: Tool[];
  logs: CallLog[];
  daily: DailyUsage[];
  sourceUsage: SourceUsage[];
  credentials: Credential[];
  team: TeamMember[];
  plans: Plan[];
  invoices: Invoice[];
  workspace: Workspace;
  workspaces: WorkspaceSummary[];
  user: User;
  connectedClients: ConnectedClient[];
  /** Set when onboarding starts polling for the first connection. */
  connectionPollStartedAt: number | null;
  onboardingPluginClient: PluginClient | null;
}

export function createMockDb(now: Date = new Date()): MockDb {
  const workspace = createWorkspace(now, siteConfig.mcpBaseUrl);
  // Daily buckets follow the same Bangkok calendar as the log filters.
  const daily = createDailyUsage(new Date(now.getTime() + 7 * 60 * 60 * 1000));
  return {
    now,
    sources: SOURCE_SEEDS.map((seed) => ({ ...seed })),
    sourceCheckedAt: new Map(
      SOURCE_SEEDS.map((seed, index) => [seed.id, new Date(now.getTime() - (index + 1) * 47_000).toISOString()]),
    ),
    tools: TOOL_SEEDS.map((tool) => structuredClone(tool)),
    logs: createCallLogs(now, 200),
    daily,
    sourceUsage: createSourceUsage(daily.reduce((sum, day) => sum + day.calls, 0)),
    credentials: createCredentials(now),
    team: createTeamMembers(now),
    plans: PLAN_SEEDS.map((plan) => ({ ...plan })),
    invoices: createInvoices(now),
    workspace,
    workspaces: [{ id: workspace.id, name: workspace.name, planId: workspace.planId }, ...OTHER_WORKSPACES],
    user: createCurrentUser(),
    connectedClients: createConnectedClients(now),
    connectionPollStartedAt: null,
    onboardingPluginClient: null,
  };
}

export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
