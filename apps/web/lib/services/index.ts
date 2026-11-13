import { createMockServices } from "./mock";
import type { Services } from "./types";

/**
 * The single switch between data backends.
 * To use a real API: implement `Services` (e.g. lib/services/http/) and return it here.
 */
export function createServices(): Services {
  return createMockServices();
}

export type * from "./types";
export { ServiceError, toServiceError, type ServiceErrorCode } from "./errors";
