"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@repo/ui/components/toaster";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { createQueryClient } from "@/lib/query/client";
import { ServicesProvider } from "@/lib/services/provider";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <ServicesProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ServicesProvider>
  );
}
