import { QueryClient } from "@tanstack/react-query";
import { ServiceError } from "@/lib/services";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Retry transient failures once; never retry "not found" or permission errors.
        retry: (failureCount, error) => {
          if (error instanceof ServiceError && ["not_found", "forbidden", "conflict"].includes(error.code)) {
            return false;
          }
          return failureCount < 1;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
