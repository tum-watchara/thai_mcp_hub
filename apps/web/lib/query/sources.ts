"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Source, SourceListParams } from "@repo/schemas";
import { useServices } from "@/lib/services/provider";
import { queryKeys } from "./keys";

export function useSourcesQuery(params: SourceListParams = {}) {
  const { sources } = useServices();
  return useQuery({
    queryKey: queryKeys.sources.list(params),
    queryFn: () => sources.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useSourceQuery(id: string) {
  const { sources } = useServices();
  return useQuery({
    queryKey: queryKeys.sources.detail(id),
    queryFn: () => sources.get(id),
  });
}

export function useSourceStatusHistoryQuery(id: string) {
  const { sources } = useServices();
  return useQuery({
    queryKey: queryKeys.sources.statusHistory(id),
    queryFn: () => sources.statusHistory(id),
  });
}

interface ToggleVariables {
  id: string;
  enabled: boolean;
}

/** Optimistically flips the toggle in every cached source list, rolls back on failure. */
export function useToggleSourceMutation() {
  const { sources } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: ToggleVariables) => sources.setEnabled(id, enabled),
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sources.all });
      const snapshot = queryClient.getQueriesData<Source[] | Source>({ queryKey: queryKeys.sources.all });
      queryClient.setQueriesData<Source[] | Source>({ queryKey: queryKeys.sources.all }, (data) => {
        if (!data) return data;
        if (Array.isArray(data)) return data.map((s) => (s.id === id ? { ...s, enabled } : s));
        return data.id === id ? { ...data, enabled } : data;
      });
      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sources.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tools.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.usage.all });
    },
  });
}

export function useSetEnabledSourcesMutation() {
  const { sources } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: readonly string[]) => sources.setEnabledSet(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sources.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tools.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.usage.all });
    },
  });
}
