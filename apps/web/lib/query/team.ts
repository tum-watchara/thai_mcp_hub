"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InviteMemberInput, UpdateMemberRoleInput } from "@repo/schemas";
import { useServices } from "@/lib/services/provider";
import { queryKeys } from "./keys";

export function useTeamQuery() {
  const { team } = useServices();
  return useQuery({
    queryKey: queryKeys.team.list(),
    queryFn: () => team.list(),
  });
}

export function useInviteMemberMutation() {
  const { team } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteMemberInput) => team.invite(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.team.all }),
  });
}

export function useUpdateMemberRoleMutation() {
  const { team } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMemberRoleInput) => team.updateRole(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.team.all }),
  });
}

export function useRemoveMemberMutation() {
  const { team } = useServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => team.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.team.all }),
  });
}
