import type {
  CallLog,
  ConnectedClient,
  ConnectionCheck,
  CreateCredentialInput,
  Credential,
  InviteMemberInput,
  Invoice,
  LogListParams,
  Paginated,
  Plan,
  PluginClient,
  RotateCredentialInput,
  RunToolInput,
  Source,
  SourceListParams,
  SourceStatusPoint,
  TeamMember,
  Tool,
  ToolListParams,
  ToolRunResult,
  UpdateMemberRoleInput,
  UpdateNotificationsInput,
  UpdateWorkspaceInput,
  UsageStat,
  User,
  Workspace,
  WorkspaceSummary,
} from "@repo/schemas";

/**
 * Data-access contracts. UI code depends on these interfaces only.
 * A real API client implements the same interfaces (see docs/ARCHITECTURE.md).
 */

export interface SourcesService {
  list(params?: SourceListParams): Promise<Source[]>;
  get(id: string): Promise<Source>;
  setEnabled(id: string, enabled: boolean): Promise<Source>;
  /** Replace the full set of enabled sources (used by onboarding). */
  setEnabledSet(ids: readonly string[]): Promise<Source[]>;
  statusHistory(id: string): Promise<SourceStatusPoint[]>;
}

export interface ToolsService {
  list(params?: ToolListParams): Promise<Tool[]>;
  get(name: string): Promise<Tool>;
  run(input: RunToolInput): Promise<ToolRunResult>;
}

/** Isolated public sandbox; executions never affect workspace logs or quota. */
export interface DemoService {
  list(): Promise<Tool[]>;
  run(input: RunToolInput): Promise<ToolRunResult>;
}

export interface LogsService {
  list(params: LogListParams): Promise<Paginated<CallLog>>;
  get(id: string): Promise<CallLog>;
}

export interface UsageService {
  summary(): Promise<UsageStat>;
}

export interface CredentialsService {
  list(): Promise<Credential[]>;
  create(input: CreateCredentialInput): Promise<Credential>;
  rotate(input: RotateCredentialInput): Promise<Credential>;
  remove(id: string): Promise<void>;
}

export interface TeamService {
  list(): Promise<TeamMember[]>;
  invite(input: InviteMemberInput): Promise<TeamMember>;
  updateRole(input: UpdateMemberRoleInput): Promise<TeamMember>;
  remove(id: string): Promise<void>;
}

export interface BillingService {
  plans(): Promise<Plan[]>;
  invoices(): Promise<Invoice[]>;
}

export interface WorkspaceService {
  current(): Promise<Workspace>;
  list(): Promise<WorkspaceSummary[]>;
  currentUser(): Promise<User>;
  update(input: UpdateWorkspaceInput): Promise<Workspace>;
  updateNotifications(input: UpdateNotificationsInput): Promise<Workspace>;
  regenerateMcpUrl(): Promise<Workspace>;
  connectedClients(): Promise<ConnectedClient[]>;
  /** Frontend demo only: records an installation without contacting a platform. */
  installPlugin(client: PluginClient): Promise<ConnectedClient>;
  /** Polled during onboarding until an AI client makes its first call. */
  checkConnection(): Promise<ConnectionCheck>;
}

export interface Services {
  demo: DemoService;
  sources: SourcesService;
  tools: ToolsService;
  logs: LogsService;
  usage: UsageService;
  credentials: CredentialsService;
  team: TeamService;
  billing: BillingService;
  workspace: WorkspaceService;
}
