import type { ConnectedClient, Credential, TeamMember, User, Workspace, WorkspaceSummary } from "@repo/schemas";
import { THAI_PEOPLE } from "./thai";

function minutesAgo(now: Date, minutes: number): string {
  return new Date(now.getTime() - minutes * 60_000).toISOString();
}

export function createWorkspace(now: Date, mcpBaseUrl: string): Workspace {
  return {
    id: "ws_siamdigital",
    name: "สยามบัญชีดิจิทัล",
    slug: "siamdigital",
    planId: "pro",
    mcpUrl: `${mcpBaseUrl}/u/ws_siamdigital/k_7f3a9c21d4e8`,
    defaultLocale: "th",
    notifications: { lineConnected: true, errorAlerts: true, quotaAlerts: true },
    createdAt: minutesAgo(now, 60 * 24 * 120),
  };
}

export const OTHER_WORKSPACES: WorkspaceSummary[] = [
  { id: "ws_rungruang", name: "ไทยรุ่งเรืองการผลิต", planId: "starter" },
  { id: "ws_personal", name: "Personal sandbox", planId: "free" },
];

export function createCurrentUser(): User {
  const owner = THAI_PEOPLE[0];
  return { id: "usr_001", name: owner.name, email: owner.email, provider: "line" };
}

export function createTeamMembers(now: Date): TeamMember[] {
  const roles: TeamMember["role"][] = ["owner", "admin", "member", "member", "viewer"];
  const members: TeamMember[] = roles.map((role, index): TeamMember => {
    const person = THAI_PEOPLE[index] ?? THAI_PEOPLE[0];
    return {
      id: `mem_${index + 1}`,
      name: person.name,
      email: person.email,
      role,
      status: "active",
      lastActiveAt: minutesAgo(now, [3, 45, 60 * 5, 60 * 26, 60 * 24 * 9][index] ?? 60),
    };
  });
  const invited = THAI_PEOPLE[5];
  members.push({
    id: "mem_6",
    name: invited.name,
    email: invited.email,
    role: "viewer",
    status: "invited",
    lastActiveAt: null,
  });
  return members;
}

export function createCredentials(now: Date): Credential[] {
  return [
    {
      id: "cred_thaipost_1",
      sourceId: "thaipost",
      label: "Thailand Post — บัญชีหลัก",
      maskedValue: "••••••••••••a91c",
      createdAt: minutesAgo(now, 60 * 24 * 45),
      lastUsedAt: minutesAgo(now, 18),
      status: "active",
    },
  ];
}

export function createConnectedClients(now: Date): ConnectedClient[] {
  return [
    { id: "cc_1", client: "claude", label: "Claude Plugin — MacBook ของสมชาย", lastSeenAt: minutesAgo(now, 2) },
    { id: "cc_2", client: "cursor", label: "Cursor Plugin — ทีมพัฒนา", lastSeenAt: minutesAgo(now, 37) },
    { id: "cc_3", client: "chatgpt", label: "ChatGPT Plugin", lastSeenAt: minutesAgo(now, 60 * 6) },
  ];
}
