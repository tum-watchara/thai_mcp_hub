import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AppLocale } from "@/i18n/routing";
import { slugify } from "./slugify";

export interface DocHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

/**
 * Extracts h2/h3 headings from an MDX file for the "On this page" TOC.
 * Runs on the server only (reads the content directory at render time).
 */
export async function getDocHeadings(locale: AppLocale, file: string): Promise<DocHeading[]> {
  const fullPath = path.join(process.cwd(), "content", "docs", locale, `${file}.mdx`);
  let source: string;
  try {
    source = await readFile(fullPath, "utf8");
  } catch {
    return [];
  }

  const headings: DocHeading[] = [];
  let inFence = false;
  for (const line of source.split(/\r?\n/)) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const hashes = match[1] ?? "";
    const raw = match[2] ?? "";
    const text = raw.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
    headings.push({ id: slugify(text), text, depth: hashes.length === 2 ? 2 : 3 });
  }
  return headings;
}
