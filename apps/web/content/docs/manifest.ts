import type { LocalizedText } from "@repo/schemas";

export interface DocPage {
  /** URL segments after /docs. Empty = /docs. */
  slug: readonly string[];
  /** File path under content/docs/{locale}/, without extension. */
  file: string;
  title: LocalizedText;
}

export interface DocSection {
  id: string;
  title: LocalizedText;
  pages: readonly DocPage[];
}

/** Docs navigation tree. Adding a page = one entry here + one MDX file per locale. */
export const DOC_SECTIONS: readonly DocSection[] = [
  {
    id: "start",
    title: { th: "เริ่มต้น", en: "Getting started" },
    pages: [
      { slug: [], file: "introduction", title: { th: "แนะนำ", en: "Introduction" } },
      { slug: ["quickstart"], file: "quickstart", title: { th: "เริ่มใช้งานใน 2 นาที", en: "Quickstart" } },
    ],
  },
  {
    id: "connect",
    title: { th: "เชื่อมต่อ", en: "Connect" },
    pages: [
      { slug: ["connect", "claude-desktop"], file: "connect/claude-desktop", title: { th: "Claude Plugin", en: "Claude plugin" } },
      { slug: ["connect", "chatgpt"], file: "connect/chatgpt", title: { th: "ChatGPT Plugin", en: "ChatGPT plugin" } },
      { slug: ["connect", "cursor"], file: "connect/cursor", title: { th: "Cursor Plugin", en: "Cursor plugin" } },
    ],
  },
  {
    id: "concepts",
    title: { th: "แนวคิดหลัก", en: "Concepts" },
    pages: [
      { slug: ["concepts", "sources"], file: "concepts/sources", title: { th: "แหล่งข้อมูล", en: "Sources" } },
      { slug: ["concepts", "tools"], file: "concepts/tools", title: { th: "Tools", en: "Tools" } },
      { slug: ["concepts", "attribution"], file: "concepts/attribution", title: { th: "การแสดงที่มา", en: "Attribution" } },
      { slug: ["concepts", "caching"], file: "concepts/caching", title: { th: "แคช", en: "Caching" } },
    ],
  },
  {
    id: "guides",
    title: { th: "การใช้งาน", en: "Guides" },
    pages: [
      { slug: ["credentials"], file: "credentials", title: { th: "Credentials (BYOK)", en: "Credentials (BYOK)" } },
      { slug: ["rate-limits"], file: "rate-limits", title: { th: "อัตราการเรียกและโควตา", en: "Rate limits and quotas" } },
    ],
  },
  {
    id: "reference",
    title: { th: "อ้างอิง", en: "Reference" },
    pages: [{ slug: ["tool-reference"], file: "tool-reference", title: { th: "รายการ Tools", en: "Tool reference" } }],
  },
];

export const DOC_PAGES: readonly DocPage[] = DOC_SECTIONS.flatMap((section) => section.pages);

export function docHref(page: DocPage): string {
  return page.slug.length ? `/docs/${page.slug.join("/")}` : "/docs";
}

export function findDocPage(slug: readonly string[]): DocPage | undefined {
  const key = slug.join("/");
  return DOC_PAGES.find((page) => page.slug.join("/") === key);
}

export function getDocNeighbours(page: DocPage): { previous?: DocPage; next?: DocPage } {
  const index = DOC_PAGES.indexOf(page);
  return { previous: DOC_PAGES[index - 1], next: DOC_PAGES[index + 1] };
}
