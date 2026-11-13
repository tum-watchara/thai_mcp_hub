"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { RunToolInput } from "@repo/schemas";
import { useServices } from "@/lib/services/provider";
import { queryKeys } from "./keys";

export function useDemoToolsQuery() {
  const { demo } = useServices();
  return useQuery({ queryKey: queryKeys.demo.tools(), queryFn: () => demo.list(), staleTime: Infinity });
}

export function useRunDemoMutation() {
  const { demo } = useServices();
  return useMutation({ mutationFn: (input: RunToolInput) => demo.run(input) });
}
