"use client";

import { useQuery } from "@tanstack/react-query";
import type { LogListParams } from "@repo/schemas";
import { useServices } from "@/lib/services/provider";
import { queryKeys } from "./keys";

export function useLogsQuery(params: LogListParams) {
  const { logs } = useServices();
  return useQuery({
    queryKey: queryKeys.logs.list(params),
    queryFn: () => logs.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useLogQuery(id: string | null) {
  const { logs } = useServices();
  return useQuery({
    queryKey: queryKeys.logs.detail(id ?? ""),
    queryFn: () => logs.get(id ?? ""),
    enabled: Boolean(id),
  });
}
