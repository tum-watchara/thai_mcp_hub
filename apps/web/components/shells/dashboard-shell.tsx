"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Menu } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@repo/ui/components/sheet";
import { cn } from "@repo/ui/lib/utils";
import { Brand } from "@/components/brand";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { useWorkspaceQuery } from "@/lib/query/workspace";
import { CommandPalette } from "./command-palette";
import { DashboardNav } from "./dashboard-nav";
import { UserMenu } from "./user-menu";
import { WorkspaceSwitcher } from "./workspace-switcher";

function PlanBadge() {
  const t = useTranslations("shell");
  const tPlans = useTranslations("plans.name");
  const workspace = useWorkspaceQuery();
  if (!workspace.data) return null;
  return (
    <Link href="/dashboard/usage" className="hidden lg:inline-flex" aria-label={t("planBadge", { plan: tPlans(workspace.data.planId) })}>
      <Badge tone="accent">{t("planBadge", { plan: tPlans(workspace.data.planId) })}</Badge>
    </Link>
  );
}

/** App shell: fixed top bar + left sidebar (a sheet on mobile). */
export function DashboardShell({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const tShell = useTranslations("shell");
  const tCommon = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
      >
        {t("skipToContent")}
      </a>
      <header className="fixed inset-x-0 top-0 z-40 flex h-[var(--topbar-height)] items-center gap-2 border-b border-border bg-background px-3 md:px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("openNavigation")}>
              <Menu aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" closeLabel={tCommon("close")}>
            <SheetHeader>
              <SheetTitle>{siteConfig.name}</SheetTitle>
            </SheetHeader>
            <SheetBody className="grid content-start gap-4">
              <WorkspaceSwitcher />
              <DashboardNav onNavigate={() => setMobileOpen(false)} />
            </SheetBody>
          </SheetContent>
        </Sheet>
        <Brand href="/dashboard" className="hidden md:inline-flex md:w-[calc(var(--sidebar-width)-1rem)]" />
        <div className="hidden md:block">
          <WorkspaceSwitcher />
        </div>
        <div className="flex flex-1 justify-center md:justify-start md:pl-2">
          <CommandPalette />
        </div>
        <div className="flex items-center gap-1">
          <Link href="/docs" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
            <BookOpen aria-hidden />
            {tShell("docs")}
          </Link>
          <PlanBadge />
          <LocaleSwitcher compact />
          <UserMenu />
        </div>
      </header>

      <aside className="fixed top-[var(--topbar-height)] bottom-0 left-0 z-30 hidden w-[var(--sidebar-width)] overflow-y-auto border-r border-border bg-subtle px-3 py-4 md:block">
        <DashboardNav />
      </aside>

      <main id="main" className="pt-[var(--topbar-height)] md:pl-[var(--sidebar-width)]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
