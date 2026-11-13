"use client";

import { useQuery } from "@tanstack/react-query";
import { useServices } from "@/lib/services/provider";
import { queryKeys } from "./keys";

export function useUsageSummaryQuery() {
  const { usage } = useServices();
  return useQuery({
    queryKey: queryKeys.usage.summary(),
    queryFn: () => usage.summary(),
  });
}

export function usePlansQuery() {
  const { billing } = useServices();
  return useQuery({
    queryKey: queryKeys.billing.plans(),
    queryFn: () => billing.plans(),
    staleTime: 5 * 60_000,
  });
}

export function useInvoicesQuery() {
  const { billing } = useServices();
  return useQuery({
    queryKey: queryKeys.billing.invoices(),
    queryFn: () => billing.invoices(),
  });
}
