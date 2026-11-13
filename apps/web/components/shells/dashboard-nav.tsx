"use client";

import { useTranslations } from "next-intl";
import { cn } from "@repo/ui/lib/utils";
import { dashboardNav, type DashboardNavItem } from "@/config/site";
import { Link, usePathname } from "@/i18n/navigation";

export function isNavItemActive(item: DashboardNavItem, pathname: string): boolean {
  if (pathname === item.href) return true;
  return item.matchPrefix && pathname.startsWith(`${item.href}/`);
}

/** Config-driven sidebar navigation (config/site.ts → dashboardNav). */
export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("mainNavigation")}>
      <ul className="grid gap-0.5">
        {dashboardNav.map((item) => {
          const active = isNavItemActive(item, pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors md:min-h-9",
                  active
                    ? "bg-accent-subtle font-medium text-accent"
                    : "text-muted-foreground hover:bg-hover hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
