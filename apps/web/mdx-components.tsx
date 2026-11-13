import type { MDXComponents } from "mdx/types";
import { Callout, DocsH2, DocsH3, DocsLink, DocsPre } from "@/features/docs/components/mdx";
import { ToolReference } from "@/features/docs/components/tool-reference";

const components: MDXComponents = {
  h2: DocsH2,
  h3: DocsH3,
  a: DocsLink,
  pre: DocsPre,
  Callout,
  ToolReference,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
