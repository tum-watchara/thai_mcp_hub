import { z } from "zod";
import { IsoDateTimeSchema, LocaleSchema } from "./common";
import { CallClientSchema } from "./call-log";
import { PlanIdSchema } from "./plan";

export const NotificationSettingsSchema = z.object({
  lineConnected: z.boolean(),
  errorAlerts: z.boolean(),
  quotaAlerts: z.boolean(),
});
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  planId: PlanIdSchema,
  mcpUrl: z.url(),
  defaultLocale: LocaleSchema,
  notifications: NotificationSettingsSchema,
  createdAt: IsoDateTimeSchema,
});
export type Workspace = z.infer<typeof WorkspaceSchema>;

export const WorkspaceSummarySchema = WorkspaceSchema.pick({ id: true, name: true, planId: true });
export type WorkspaceSummary = z.infer<typeof WorkspaceSummarySchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  provider: z.enum(["line", "google"]),
});
export type User = z.infer<typeof UserSchema>;

export const ConnectedClientSchema = z.object({
  id: z.string(),
  client: CallClientSchema,
  label: z.string(),
  lastSeenAt: IsoDateTimeSchema,
});
export type ConnectedClient = z.infer<typeof ConnectedClientSchema>;

export const PluginClientSchema = z.enum(["chatgpt", "claude", "cursor"]);
export type PluginClient = z.infer<typeof PluginClientSchema>;

export const ConnectionCheckSchema = z.object({
  detected: z.boolean(),
  client: CallClientSchema.optional(),
  detectedAt: IsoDateTimeSchema.optional(),
});
export type ConnectionCheck = z.infer<typeof ConnectionCheckSchema>;

export const UpdateWorkspaceInputSchema = z.object({
  name: z.string().trim().min(2, { error: "tooShort" }).max(60, { error: "tooLong" }),
});
export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceInputSchema>;

export const UpdateNotificationsInputSchema = NotificationSettingsSchema.partial();
export type UpdateNotificationsInput = z.infer<typeof UpdateNotificationsInputSchema>;
