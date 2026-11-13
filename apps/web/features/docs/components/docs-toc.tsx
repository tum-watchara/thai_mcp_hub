"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@repo/ui/lib/utils";
import type { DocHeading } from "@/lib/docs/headings";

/** Right-hand "On this page" list with scroll-spy. */
export function DocsToc({ headings }: { headings: DocHeading[] }) {
  const t = useTranslations("docs");
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        const first = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (first) setActiveId(first.target.id);
      },
      { rootMargin: "-72px 0px -65% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 shrink-0 overflow-y-auto py-8 pl-2 xl:block">
      <nav aria-label={t("onThisPage")}>
        <p className="mb-3 text-xs font-medium text-muted-foreground">{t("onThisPage")}</p>
        <ul className="grid gap-1.5 border-l border-border text-[13px]">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={activeId === heading.id ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-0.5 transition-colors",
                  heading.depth === 3 ? "pl-6" : "pl-3",
                  activeId === heading.id
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
