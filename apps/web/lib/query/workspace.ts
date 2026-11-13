"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PluginClient, UpdateNotificationsInput, UpdateWorkspaceInput, Workspace } from "@repo/schemas";
import { useServices } from "@/lib/services/provider";
import { queryKeys } from "./keys";

export function useWorkspaceQuery() {
  const { workspace } = useServices();
  return useQuery({
    queryKey: queryKeys.workspace.current(),
    queryFn: () => workspace.current(),
  });
}

export function useWorkspacesQuery() {
  const { workspace } = useServices();
  return useQuery({
    queryKey: queryKeys.workspace.list(),
    queryFn: () => workspace.list(),
  });
}

export function useCurrentUserQuery() {
  const { workspace } = useServices();
  return useQuery({
    queryKey: queryKeys.workspace.user(),
    queryFn: () => workspace.currentUser(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useConnectedClientsQuery() {
  const { workspace } = useServices();
  return useQuery({
    queryKey: queryKeys.workspace.clients(),
    queryFn: () => workspace.connectedClients(),
  });
}

export function useInstallPluginMutation() {
  const { workspace } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (client: PluginClient) => workspace.installPlugin(client),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.workspace.connection(), { detected: false });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workspace.clients() });
    },
  });
}

/** Polls every 1.5 s until the first AI client connects. */
export function useConnectionCheckQuery(active: boolean) {
  const { workspace } = useServices();
  return useQuery({
    queryKey: queryKeys.workspace.connection(),
    queryFn: () => workspace.checkConnection(),
    enabled: active,
    refetchInterval: (query) => (query.state.data?.detected ? false : 1500),
  });
}

function useWorkspaceWriter() {
  const queryClient = useQueryClient();
  return (workspace: Workspace) => {
    queryClient.setQueryData(queryKeys.workspace.current(), workspace);
    void queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all });
  };
}

export function useUpdateWorkspaceMutation() {
  const { workspace } = useServices();
  const write = useWorkspaceWriter();
  return useMutation({
    mutationFn: (input: UpdateWorkspaceInput) => workspace.update(input),
    onSuccess: write,
  });
}

export function useUpdateNotificationsMutation() {
  const { workspace } = useServices();
  const write = useWorkspaceWriter();
  return useMutation({
    mutationFn: (input: UpdateNotificationsInput) => workspace.updateNotifications(input),
    onSuccess: write,
  });
}

export function useRegenerateMcpUrlMutation() {
  const { workspace } = useServices();
  const write = useWorkspaceWriter();
  return useMutation({
    mutationFn: () => workspace.regenerateMcpUrl(),
    onSuccess: write,
  });
}
