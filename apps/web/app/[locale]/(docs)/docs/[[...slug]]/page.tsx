import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { findDocPage, getDocNeighbours } from "@/content/docs/manifest";
import { DocsMobileNav } from "@/features/docs/components/docs-nav";
import { DocsPager } from "@/features/docs/components/docs-pager";
import { DocsToc } from "@/features/docs/components/docs-toc";
import { routing } from "@/i18n/routing";
import { getDocHeadings } from "@/lib/docs/headings";

interface DocsPageProps {
  params: Promise<{ locale: string; slug?: string[] }>;
}

async function resolve(params: DocsPageProps["params"]) {
  const { locale: raw, slug } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const page = findDocPage(slug ?? []);
  return { locale, page };
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { locale, page } = await resolve(params);
  return page ? { title: page.title[locale] } : {};
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { locale, page } = await resolve(params);
  if (!page) notFound();

  const { default: Content } = await import(`@/content/docs/${locale}/${page.file}.mdx`);
  const headings = await getDocHeadings(locale, page.file);
  const { previous, next } = getDocNeighbours(page);

  return (
    <div className="flex gap-8">
      <article className="min-w-0 flex-1 py-8 md:py-10">
        <div className="mb-6 lg:hidden">
          <DocsMobileNav />
        </div>
        <div className="docs-prose max-w-[720px]">
          <Content />
        </div>
        <div className="max-w-[720px]">
          <DocsPager previous={previous} next={next} />
        </div>
      </article>
      <DocsToc headings={headings} />
    </div>
  );
}
