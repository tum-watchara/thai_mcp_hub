import { z } from "zod";
import { IsoDateTimeSchema } from "./common";

export const TeamRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);
export type TeamRole = z.infer<typeof TeamRoleSchema>;

/** Roles that can be granted through invites or role changes (ownership is transferred separately). */
export const AssignableRoleSchema = z.enum(["admin", "member", "viewer"]);
export type AssignableRole = z.infer<typeof AssignableRoleSchema>;

export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: TeamRoleSchema,
  status: z.enum(["active", "invited"]),
  lastActiveAt: IsoDateTimeSchema.nullable(),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

export const InviteMemberInputSchema = z.object({
  email: z.email({ error: "invalidEmail" }),
  role: AssignableRoleSchema,
});
export type InviteMemberInput = z.infer<typeof InviteMemberInputSchema>;

export const UpdateMemberRoleInputSchema = z.object({
  id: z.string(),
  role: AssignableRoleSchema,
});
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleInputSchema>;
