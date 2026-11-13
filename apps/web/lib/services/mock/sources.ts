import { createStatusHistory, type SourceSeed } from "@repo/mocks";
import { isSourceToggleable, planIncludes, type Source, type SourceListParams } from "@repo/schemas";
import { ServiceError } from "../errors";
import type { SourcesService } from "../types";
import type { MockDb } from "./db";
import { notFound, simulate } from "./simulate";

export function hydrateSource(db: MockDb, seed: SourceSeed): Source {
  return {
    ...seed,
    toolCount: db.tools.filter((tool) => tool.sourceId === seed.id).length,
    credentialConfigured: db.credentials.some(
      (credential) => credential.sourceId === seed.id && credential.status === "active",
    ),
    lastCheckedAt: db.sourceCheckedAt.get(seed.id) ?? db.now.toISOString(),
  };
}

function matchesSearch(db: MockDb, seed: SourceSeed, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    seed.id,
    seed.name.th,
    seed.name.en,
    seed.provider.th,
    seed.provider.en,
    ...db.tools.filter((tool) => tool.sourceId === seed.id).map((tool) => tool.name),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export class MockSourcesService implements SourcesService {
  constructor(private readonly db: MockDb) {}

  list(params: SourceListParams = {}): Promise<Source[]> {
    return simulate(() =>
      this.db.sources
        .filter((seed) => (params.category ? seed.category === params.category : true))
        .filter((seed) => {
          if (params.enabled === "enabled") return seed.enabled;
          if (params.enabled === "disabled") return !seed.enabled;
          return true;
        })
        .filter((seed) => matchesSearch(this.db, seed, params.search ?? ""))
        .map((seed) => hydrateSource(this.db, seed)),
    );
  }

  get(id: string): Promise<Source> {
    return simulate(() => {
      const seed = this.db.sources.find((s) => s.id === id);
      return seed ? hydrateSource(this.db, seed) : notFound("Source", id);
    });
  }

  setEnabled(id: string, enabled: boolean): Promise<Source> {
    return simulate(
      () => {
        const seed = this.db.sources.find((s) => s.id === id) ?? notFound("Source", id);
        if (!isSourceToggleable(seed)) throw new ServiceError("forbidden", "Source is pending permission");
        if (enabled && !planIncludes(this.db.workspace.planId, seed.plan)) {
          throw new ServiceError("forbidden", "Plan does not include this source");
        }
        const source = hydrateSource(this.db, seed);
        if (enabled && source.requiresCredential && !source.credentialConfigured) {
          throw new ServiceError("forbidden", "Credential required");
        }
        seed.enabled = enabled;
        return hydrateSource(this.db, seed);
      },
      { kind: "write" },
    );
  }

  setEnabledSet(ids: readonly string[]): Promise<Source[]> {
    return simulate(
      () => {
        const wanted = new Set(ids);
        for (const seed of this.db.sources) {
          const source = hydrateSource(this.db, seed);
          const allowed =
            isSourceToggleable(seed) &&
            planIncludes(this.db.workspace.planId, seed.plan) &&
            (!source.requiresCredential || source.credentialConfigured);
          seed.enabled = allowed && wanted.has(seed.id);
        }
        return this.db.sources.map((seed) => hydrateSource(this.db, seed));
      },
      { kind: "write" },
    );
  }

  statusHistory(id: string) {
    return simulate(() => {
      const seed = this.db.sources.find((s) => s.id === id) ?? notFound("Source", id);
      return createStatusHistory(this.db.now, seed.id, seed.status);
    });
  }
}
