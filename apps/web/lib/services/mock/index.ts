import type { Services } from "../types";
import { MockCredentialsService } from "./credentials";
import { MockDemoService } from "./demo";
import { createMockDb } from "./db";
import { MockLogsService } from "./logs";
import { MockSourcesService } from "./sources";
import { MockTeamService } from "./team";
import { MockToolsService } from "./tools";
import { MockUsageService } from "./usage";
import { MockBillingService, MockWorkspaceService } from "./workspace";

export function createMockServices(): Services {
  const db = createMockDb();
  return {
    demo: new MockDemoService(),
    sources: new MockSourcesService(db),
    tools: new MockToolsService(db),
    logs: new MockLogsService(db),
    usage: new MockUsageService(db),
    credentials: new MockCredentialsService(db),
    team: new MockTeamService(db),
    billing: new MockBillingService(db),
    workspace: new MockWorkspaceService(db),
  };
}
