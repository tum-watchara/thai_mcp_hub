import {
  Activity,
  CreditCard,
  Database,
  FlaskConical,
  KeyRound,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Locale, PluginClient } from "@repo/schemas";

/**
 * Single source of truth for product identity, URLs and navigation.
 * Renaming the product = editing this file.
 */
export const siteConfig = {
  name: "Thai MCP Hub",
  shortName: "MCP Hub",
  tagline: {
    th: "ข้อมูลไทยที่ใช้งานได้จริง จากแหล่งทางการ ตรวจสอบที่มาได้ ทำงานอัตโนมัติได้ และเชื่อมกับระบบภายในของคุณ",
    en: "Thai data you can actually work with — official sources, traceable, automatable, and connected to your internal systems.",
  } satisfies Record<Locale, string>,
  url: "https://thai-mcp-hub.example",
  mcpBaseUrl: "https://mcp.thai-mcp-hub.example",
  links: {
    github: "https://github.com/thai-mcp-hub",
    status: "https://status.thai-mcp-hub.example",
    terms: "https://thai-mcp-hub.example/legal/terms",
    privacy: "https://thai-mcp-hub.example/legal/privacy",
    contactSales: "mailto:sales@thai-mcp-hub.example",
  },
  /** Sample juristic ID used in empty states and onboarding (exists in mock data). */
  sampleJuristicId: "0105561012346",
} as const;

/** Set listingUrl only after the real plugin has been published on that platform. */
export const pluginIntegrations = {
  chatgpt: { name: "ChatGPT", listingUrl: null, guideUrl: "https://developers.openai.com/plugins/quickstart" },
  claude: { name: "Claude", listingUrl: null, guideUrl: "https://claude.com/resources/articles/build-plugins-for-claude" },
  cursor: { name: "Cursor", listingUrl: null, guideUrl: "https://cursor.com/docs/plugins" },
} satisfies Record<PluginClient, { name: string; listingUrl: string | null; guideUrl: string }>;

export type NavLabelKey =
  | "overview"
  | "sources"
  | "playground"
  | "logs"
  | "credentials"
  | "team"
  | "usage"
  | "settings";

export interface DashboardNavItem {
  labelKey: NavLabelKey;
  href: string;
  icon: LucideIcon;
  /** Match child routes as active too. */
  matchPrefix: boolean;
}

/** Dashboard sidebar. Adding a page = adding one entry here (+ its message key). */
export const dashboardNav: readonly DashboardNavItem[] = [
  { labelKey: "overview", href: "/dashboard", icon: LayoutDashboard, matchPrefix: false },
  { labelKey: "sources", href: "/dashboard/sources", icon: Database, matchPrefix: true },
  { labelKey: "playground", href: "/dashboard/playground", icon: FlaskConical, matchPrefix: true },
  { labelKey: "logs", href: "/dashboard/logs", icon: Activity, matchPrefix: true },
  { labelKey: "credentials", href: "/dashboard/credentials", icon: KeyRound, matchPrefix: true },
  { labelKey: "team", href: "/dashboard/team", icon: Users, matchPrefix: true },
  { labelKey: "usage", href: "/dashboard/usage", icon: CreditCard, matchPrefix: true },
  { labelKey: "settings", href: "/dashboard/settings", icon: Settings, matchPrefix: true },
];

export type MarketingNavKey = "sources" | "pricing" | "docs";

export const marketingNav: readonly { labelKey: MarketingNavKey; href: string }[] = [
  { labelKey: "sources", href: "/sources" },
  { labelKey: "docs", href: "/docs" },
];

export type FooterLinkKey = "docs" | "github" | "status" | "terms" | "privacy";

export const footerNav: readonly { labelKey: FooterLinkKey; href: string; external: boolean }[] = [
  { labelKey: "docs", href: "/docs", external: false },
  { labelKey: "github", href: siteConfig.links.github, external: true },
  { labelKey: "status", href: siteConfig.links.status, external: true },
  { labelKey: "terms", href: siteConfig.links.terms, external: true },
  { labelKey: "privacy", href: siteConfig.links.privacy, external: true },
];
