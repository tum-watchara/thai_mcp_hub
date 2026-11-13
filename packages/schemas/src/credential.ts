import { z } from "zod";
import { IsoDateTimeSchema } from "./common";

export const CredentialStatusSchema = z.enum(["active", "invalid", "expired"]);
export type CredentialStatus = z.infer<typeof CredentialStatusSchema>;

export const CredentialSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  label: z.string(),
  maskedValue: z.string(),
  createdAt: IsoDateTimeSchema,
  lastUsedAt: IsoDateTimeSchema.nullable(),
  status: CredentialStatusSchema,
});
export type Credential = z.infer<typeof CredentialSchema>;

/* Validation messages are i18n keys under `validation.*` in the web app. */

export const CreateCredentialInputSchema = z.object({
  sourceId: z.string().min(1, { error: "required" }),
  label: z.string().trim().min(1, { error: "required" }).max(60, { error: "tooLong" }),
  value: z.string().trim().min(8, { error: "credentialTooShort" }),
});
export type CreateCredentialInput = z.infer<typeof CreateCredentialInputSchema>;

export const RotateCredentialInputSchema = z.object({
  id: z.string(),
  value: z.string().trim().min(8, { error: "credentialTooShort" }),
});
export type RotateCredentialInput = z.infer<typeof RotateCredentialInputSchema>;
