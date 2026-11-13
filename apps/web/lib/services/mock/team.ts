import type { InviteMemberInput, TeamMember, UpdateMemberRoleInput } from "@repo/schemas";
import { ServiceError } from "../errors";
import type { TeamService } from "../types";
import { createId, type MockDb } from "./db";
import { notFound, simulate } from "./simulate";

const ROLE_ORDER: Record<TeamMember["role"], number> = { owner: 0, admin: 1, member: 2, viewer: 3 };

export class MockTeamService implements TeamService {
  constructor(private readonly db: MockDb) {}

  list(): Promise<TeamMember[]> {
    return simulate(() => [...this.db.team].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]));
  }

  invite(input: InviteMemberInput): Promise<TeamMember> {
    return simulate(
      () => {
        const email = input.email.trim().toLowerCase();
        if (this.db.team.some((member) => member.email.toLowerCase() === email)) {
          throw new ServiceError("conflict", "Member already exists");
        }
        const member: TeamMember = {
          id: createId("mem"),
          name: email.split("@")[0] ?? email,
          email,
          role: input.role,
          status: "invited",
          lastActiveAt: null,
        };
        this.db.team.push(member);
        return member;
      },
      { kind: "write" },
    );
  }

  updateRole(input: UpdateMemberRoleInput): Promise<TeamMember> {
    return simulate(
      () => {
        const member = this.db.team.find((m) => m.id === input.id) ?? notFound("TeamMember", input.id);
        if (member.role === "owner") throw new ServiceError("forbidden", "Owner role cannot be changed");
        member.role = input.role;
        return member;
      },
      { kind: "write" },
    );
  }

  remove(id: string): Promise<void> {
    return simulate(
      () => {
        const member = this.db.team.find((m) => m.id === id) ?? notFound("TeamMember", id);
        if (member.role === "owner") throw new ServiceError("forbidden", "Owner cannot be removed");
        this.db.team = this.db.team.filter((m) => m.id !== id);
      },
      { kind: "write" },
    );
  }
}
