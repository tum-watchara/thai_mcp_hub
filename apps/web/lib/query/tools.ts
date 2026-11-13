"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RunToolInput, ToolListParams } from "@repo/schemas";
import { useServices } from "@/lib/services/provider";
import { queryKeys } from "./keys";

export function useToolsQuery(params: ToolListParams = {}) {
  const { tools } = useServices();
  return useQuery({
    queryKey: queryKeys.tools.list(params),
    queryFn: () => tools.list(params),
  });
}

export function useToolQuery(name: string | undefined) {
  const { tools } = useServices();
  return useQuery({
    queryKey: queryKeys.tools.detail(name ?? ""),
    queryFn: () => tools.get(name ?? ""),
    enabled: Boolean(name),
  });
}

export function useRunToolMutation() {
  const { tools } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RunToolInput) => tools.run(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.logs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.usage.all });
    },
  });
}
