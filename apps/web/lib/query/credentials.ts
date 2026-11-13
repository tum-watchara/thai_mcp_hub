"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateCredentialInput, RotateCredentialInput } from "@repo/schemas";
import { useServices } from "@/lib/services/provider";
import { queryKeys } from "./keys";

export function useCredentialsQuery() {
  const { credentials } = useServices();
  return useQuery({
    queryKey: queryKeys.credentials.list(),
    queryFn: () => credentials.list(),
  });
}

function useInvalidateCredentialState() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.credentials.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.sources.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.tools.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.usage.all });
  };
}

export function useCreateCredentialMutation() {
  const { credentials } = useServices();
  const invalidate = useInvalidateCredentialState();
  return useMutation({
    mutationFn: (input: CreateCredentialInput) => credentials.create(input),
    onSuccess: invalidate,
  });
}

export function useRotateCredentialMutation() {
  const { credentials } = useServices();
  const invalidate = useInvalidateCredentialState();
  return useMutation({
    mutationFn: (input: RotateCredentialInput) => credentials.rotate(input),
    onSuccess: invalidate,
  });
}

export function useDeleteCredentialMutation() {
  const { credentials } = useServices();
  const invalidate = useInvalidateCredentialState();
  return useMutation({
    mutationFn: (id: string) => credentials.remove(id),
    onSuccess: invalidate,
  });
}
