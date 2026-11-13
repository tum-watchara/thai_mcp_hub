/**
 * Transport-agnostic error raised by every service implementation.
 * UI maps `code` to a translated "what happened / how to fix" message.
 */
export const SERVICE_ERROR_CODES = [
  "network",
  "server",
  "not_found",
  "rate_limited",
  "conflict",
  "forbidden",
] as const;

export type ServiceErrorCode = (typeof SERVICE_ERROR_CODES)[number];

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode, message?: string) {
    super(message ?? code);
    this.name = "ServiceError";
    this.code = code;
  }
}

export function toServiceError(error: unknown): ServiceError {
  if (error instanceof ServiceError) return error;
  return new ServiceError("server", error instanceof Error ? error.message : undefined);
}
