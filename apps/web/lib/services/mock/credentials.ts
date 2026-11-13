import type { CreateCredentialInput, Credential, RotateCredentialInput } from "@repo/schemas";
import { ServiceError } from "../errors";
import type { CredentialsService } from "../types";
import { createId, type MockDb } from "./db";
import { notFound, simulate } from "./simulate";

function mask(value: string): string {
  return `${"•".repeat(12)}${value.trim().slice(-4)}`;
}

export class MockCredentialsService implements CredentialsService {
  constructor(private readonly db: MockDb) {}

  list(): Promise<Credential[]> {
    return simulate(() => [...this.db.credentials].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  create(input: CreateCredentialInput): Promise<Credential> {
    return simulate(
      () => {
        const source = this.db.sources.find((s) => s.id === input.sourceId) ?? notFound("Source", input.sourceId);
        if (!source.requiresCredential) throw new ServiceError("conflict", "Source does not use credentials");
        const credential: Credential = {
          id: createId("cred"),
          sourceId: input.sourceId,
          label: input.label.trim(),
          maskedValue: mask(input.value),
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
          status: "active",
        };
        this.db.credentials.push(credential);
        return credential;
      },
      { kind: "write" },
    );
  }

  rotate(input: RotateCredentialInput): Promise<Credential> {
    return simulate(
      () => {
        const credential = this.db.credentials.find((c) => c.id === input.id) ?? notFound("Credential", input.id);
        credential.maskedValue = mask(input.value);
        credential.status = "active";
        credential.createdAt = new Date().toISOString();
        return credential;
      },
      { kind: "write" },
    );
  }

  remove(id: string): Promise<void> {
    return simulate(
      () => {
        const index = this.db.credentials.findIndex((c) => c.id === id);
        if (index === -1) notFound("Credential", id);
        const [removed] = this.db.credentials.splice(index, 1);
        // A BYOK source without an active credential can no longer stay enabled.
        if (removed && !this.db.credentials.some((c) => c.sourceId === removed.sourceId && c.status === "active")) {
          const source = this.db.sources.find((s) => s.id === removed.sourceId);
          if (source) source.enabled = false;
        }
      },
      { kind: "write" },
    );
  }
}
