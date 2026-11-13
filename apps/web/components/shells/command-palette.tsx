"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Database, Search, Wrench } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/command";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/dialog";
import { Kbd } from "@repo/ui/components/kbd";
import { dashboardNav } from "@/config/site";
import { useRouter } from "@/i18n/navigation";
import { useSourcesQuery } from "@/lib/query/sources";
import { useToolsQuery } from "@/lib/query/tools";
import { useLocalized } from "@/lib/utils/format";

/** ⌘K / Ctrl+K palette: pages, sources and tools. */
export function CommandPalette() {
  const t = useTranslations("shell");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const localized = useLocalized();
  const [open, setOpen] = useState(false);
  const sources = useSourcesQuery();
  const tools = useToolsQuery({ enabledOnly: true });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="w-full max-w-72 justify-start gap-2 text-muted-foreground sm:w-64"
        onClick={() => setOpen(true)}
        aria-label={t("searchPlaceholder")}
      >
        <Search aria-hidden />
        <span className="hidden flex-1 truncate text-left sm:inline">{t("search")}</span>
        <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent closeLabel={tCommon("close")} className="max-w-xl gap-0 overflow-hidden p-0 md:p-0">
          <DialogTitle className="sr-only">{t("commandTitle")}</DialogTitle>
          <Command>
            <CommandInput placeholder={t("searchPlaceholder")} />
            <CommandList>
              <CommandEmpty>{t("commandEmpty")}</CommandEmpty>
              <CommandGroup heading={t("commandPages")}>
                {dashboardNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem key={item.href} value={`page ${tNav(item.labelKey)} ${item.href}`} onSelect={() => go(item.href)}>
                      <Icon aria-hidden />
                      {tNav(item.labelKey)}
                    </CommandItem>
                  );
                })}
                <CommandItem value={`page ${t("docs")} docs`} onSelect={() => go("/docs")}>
                  <BookOpen aria-hidden />
                  {t("docs")}
                </CommandItem>
              </CommandGroup>
              {sources.data?.length ? (
                <CommandGroup heading={t("commandSources")}>
                  {sources.data.map((source) => (
                    <CommandItem
                      key={source.id}
                      value={`source ${source.name.th} ${source.name.en} ${source.id}`}
                      onSelect={() => go(`/dashboard/sources/${source.id}`)}
                    >
                      <Database aria-hidden />
                      {localized(source.name)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {tools.data?.length ? (
                <CommandGroup heading={t("commandTools")}>
                  {tools.data.map((tool) => (
                    <CommandItem
                      key={tool.name}
                      value={`tool ${tool.name} ${tool.description.th} ${tool.description.en}`}
                      onSelect={() => go(`/dashboard/playground?tool=${encodeURIComponent(tool.name)}`)}
                    >
                      <Wrench aria-hidden />
                      <code className="font-mono text-[13px]">{tool.name}</code>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
