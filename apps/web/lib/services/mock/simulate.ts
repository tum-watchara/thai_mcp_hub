import { ServiceError, type ServiceErrorCode } from "../errors";

/**
 * Network simulation for mock services: random latency, occasional failures.
 * Override the error rate in the browser console for QA:
 *   localStorage.setItem("mock:errorRate", "0.5")   // 50% failures
 *   localStorage.setItem("mock:errorRate", "0")     // never fail
 */
export const MOCK_LATENCY_MS = { min: 200, max: 800 } as const;
const DEFAULT_READ_ERROR_RATE = 0.04;
const DEFAULT_WRITE_ERROR_RATE = 0.03;

function configuredErrorRate(fallback: number): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem("mock:errorRate");
    if (raw === null) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : fallback;
  } catch {
    return fallback;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const FAILURE_CODES: readonly ServiceErrorCode[] = ["network", "server", "network"];

interface SimulateOptions {
  kind?: "read" | "write";
  /** Skip random failure (e.g. polling endpoints). */
  reliable?: boolean;
  minLatency?: number;
  maxLatency?: number;
}

/**
 * Runs `operation` after a random delay. The operation executes only if the
 * simulated request "succeeds", so failed writes never partially mutate state.
 * Results are deep-cloned so callers can't mutate the mock database.
 */
export async function simulate<T>(operation: () => T, options: SimulateOptions = {}): Promise<T> {
  const min = options.minLatency ?? MOCK_LATENCY_MS.min;
  const max = options.maxLatency ?? MOCK_LATENCY_MS.max;
  await wait(min + Math.random() * (max - min));

  if (!options.reliable) {
    const rate = configuredErrorRate(options.kind === "write" ? DEFAULT_WRITE_ERROR_RATE : DEFAULT_READ_ERROR_RATE);
    if (Math.random() < rate) {
      const code = FAILURE_CODES[Math.floor(Math.random() * FAILURE_CODES.length)] ?? "server";
      throw new ServiceError(code, "Simulated failure");
    }
  }

  return structuredClone(operation());
}

export function notFound(entity: string, id: string): never {
  throw new ServiceError("not_found", `${entity} "${id}" not found`);
}
