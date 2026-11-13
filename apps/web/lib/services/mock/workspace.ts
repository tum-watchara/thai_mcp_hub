import type {
  ConnectedClient,
  ConnectionCheck,
  Invoice,
  Plan,
  PluginClient,
  UpdateNotificationsInput,
  UpdateWorkspaceInput,
  User,
  Workspace,
  WorkspaceSummary,
} from "@repo/schemas";
import { pluginIntegrations, siteConfig } from "@/config/site";
import type { BillingService, WorkspaceService } from "../types";
import type { MockDb } from "./db";
import { simulate } from "./simulate";

/** How long onboarding waits before the simulated client "connects". */
const CONNECTION_DETECT_AFTER_MS = 6000;

export class MockWorkspaceService implements WorkspaceService {
  constructor(private readonly db: MockDb) {}

  current(): Promise<Workspace> {
    return simulate(() => this.db.workspace);
  }

  list(): Promise<WorkspaceSummary[]> {
    return simulate(() => this.db.workspaces);
  }

  currentUser(): Promise<User> {
    return simulate(() => this.db.user, { reliable: true });
  }

  update(input: UpdateWorkspaceInput): Promise<Workspace> {
    return simulate(
      () => {
        this.db.workspace.name = input.name.trim();
        const summary = this.db.workspaces.find((w) => w.id === this.db.workspace.id);
        if (summary) summary.name = this.db.workspace.name;
        return this.db.workspace;
      },
      { kind: "write" },
    );
  }

  updateNotifications(input: UpdateNotificationsInput): Promise<Workspace> {
    return simulate(
      () => {
        this.db.workspace.notifications = { ...this.db.workspace.notifications, ...input };
        return this.db.workspace;
      },
      { kind: "write" },
    );
  }

  regenerateMcpUrl(): Promise<Workspace> {
    return simulate(
      () => {
        const key = Math.random().toString(16).slice(2, 14).padEnd(12, "0");
        this.db.workspace.mcpUrl = `${siteConfig.mcpBaseUrl}/u/${this.db.workspace.id}/k_${key}`;
        this.db.connectedClients = [];
        this.db.connectionPollStartedAt = null;
        this.db.onboardingPluginClient = null;
        return this.db.workspace;
      },
      { kind: "write" },
    );
  }

  connectedClients(): Promise<ConnectedClient[]> {
    return simulate(() => this.db.connectedClients);
  }

  installPlugin(client: PluginClient): Promise<ConnectedClient> {
    return simulate(() => {
      const connection: ConnectedClient = {
        id: `plugin_${client}`,
        client,
        label: `${pluginIntegrations[client].name} — ${siteConfig.name} Plugin`,
        lastSeenAt: new Date().toISOString(),
      };
      this.db.connectedClients = [...this.db.connectedClients.filter((entry) => entry.client !== client), connection];
      this.db.onboardingPluginClient = client;
      this.db.connectionPollStartedAt = Date.now();
      return connection;
    }, { kind: "write" });
  }

  checkConnection(): Promise<ConnectionCheck> {
    return simulate(
      () => {
        if (!this.db.onboardingPluginClient) return { detected: false };
        const startedAt = this.db.connectionPollStartedAt ?? Date.now();
        this.db.connectionPollStartedAt = startedAt;
        if (Date.now() - startedAt < CONNECTION_DETECT_AFTER_MS) return { detected: false };
        return { detected: true, client: this.db.onboardingPluginClient, detectedAt: new Date().toISOString() };
      },
      { reliable: true, minLatency: 150, maxLatency: 300 },
    );
  }
}

export class MockBillingService implements BillingService {
  constructor(private readonly db: MockDb) {}

  plans(): Promise<Plan[]> {
    return simulate(() => this.db.plans);
  }

  invoices(): Promise<Invoice[]> {
    return simulate(() => this.db.invoices);
  }
}
