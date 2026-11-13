"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createServices } from "./index";
import type { Services } from "./types";

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({ children, services }: { children: ReactNode; services?: Services }) {
  // One instance per browser session so mock state (toggles, credentials) persists across navigation.
  const [value] = useState<Services>(() => services ?? createServices());
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error("useServices() must be used inside <ServicesProvider>");
  return services;
}
