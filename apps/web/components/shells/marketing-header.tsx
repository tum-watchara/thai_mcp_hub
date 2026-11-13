"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@repo/ui/components/sheet";
import { cn } from "@repo/ui/lib/utils";
import { Brand } from "@/components/brand";
import { GitHubMark } from "@/components/github-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { marketingNav, siteConfig } from "@/config/site";
import { Link, usePathname } from "@/i18n/navigation";

export function MarketingHeader() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav aria-label={t("mainNavigation")} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {marketingNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    isActive(item.href) && "text-foreground",
                  )}
                >
                  {t(`marketing.${item.labelKey}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <a href={siteConfig.links.github} target="_blank" rel="noreferrer" aria-label={t("github")} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-foreground")}>
            <GitHubMark className="size-5" />
          </a>
          <LocaleSwitcher />
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
            {t("login")}
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "primary", size: "sm" }), "hidden sm:inline-flex")}>
            {t("startFree")}
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("openNavigation")}>
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" closeLabel={tCommon("close")}>
              <SheetHeader>
                <SheetTitle>{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <SheetBody>
                <nav aria-label={t("mainNavigation")}>
                  <ul className="grid gap-1">
                    {marketingNav.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex h-11 items-center rounded-md px-3 text-sm hover:bg-hover"
                        >
                          {t(`marketing.${item.labelKey}`)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-6 grid gap-2">
                  <Link href="/login" className={buttonVariants({ variant: "primary" })} onClick={() => setOpen(false)}>
                    {t("startFree")}
                  </Link>
                  <Link href="/login" className={buttonVariants({ variant: "secondary" })} onClick={() => setOpen(false)}>
                    {t("login")}
                  </Link>
                </div>
              </SheetBody>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
