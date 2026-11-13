"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PanelLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@repo/ui/components/sheet";
import { cn } from "@repo/ui/lib/utils";
import { DOC_SECTIONS, docHref } from "@/content/docs/manifest";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocalized } from "@/lib/utils/format";

function DocsNavTree({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("docs");
  const pathname = usePathname();
  const localized = useLocalized();

  return (
    <nav aria-label={t("navLabel")} className="grid gap-6 text-sm">
      {DOC_SECTIONS.map((section) => (
        <div key={section.id} className="grid gap-1">
          <p className="px-3 text-xs font-medium text-muted-foreground">{localized(section.title)}</p>
          <ul className="grid gap-0.5">
            {section.pages.map((page) => {
              const href = docHref(page);
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-9 items-center rounded-md px-3 transition-colors md:min-h-8",
                      active ? "bg-accent-subtle font-medium text-accent" : "text-foreground hover:bg-hover",
                    )}
                  >
                    {localized(page.title)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsSidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border py-8 pr-4 lg:block">
      <DocsNavTree />
    </aside>
  );
}

export function DocsMobileNav() {
  const t = useTranslations("docs");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="lg:hidden">
          <PanelLeft aria-hidden />
          {t("openNav")}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" closeLabel={tCommon("close")}>
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <DocsNavTree onNavigate={() => setOpen(false)} />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
