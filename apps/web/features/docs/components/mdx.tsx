import { isValidElement, type ComponentProps, type ReactNode } from "react";
import { Info, TriangleAlert } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { AppCodeBlock } from "@/components/copy-field";
import { Link } from "@/i18n/navigation";
import { slugify, textOf } from "@/lib/docs/slugify";

export function DocsH2({ children }: ComponentProps<"h2">) {
  const id = slugify(textOf(children));
  return (
    <h2 id={id} className="group">
      <a href={`#${id}`} className="text-foreground! no-underline!">
        {children}
      </a>
    </h2>
  );
}

export function DocsH3({ children }: ComponentProps<"h3">) {
  const id = slugify(textOf(children));
  return (
    <h3 id={id}>
      <a href={`#${id}`} className="text-foreground! no-underline!">
        {children}
      </a>
    </h3>
  );
}

/** Internal links stay locale-aware; external links open in a new tab. */
export function DocsLink({ href = "", children }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  if (href.startsWith("#")) return <a href={href}>{children}</a>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

/** Fenced code blocks → CodeBlock with language label and copy button. */
export function DocsPre({ children }: ComponentProps<"pre">) {
  if (isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    const language = children.props.className?.replace(/^language-/, "") ?? "text";
    const code = textOf(children.props.children).replace(/\n$/, "");
    return <AppCodeBlock code={code} language={language} className="my-5" />;
  }
  return <pre>{children}</pre>;
}

interface CalloutProps {
  type?: "note" | "warning";
  children: ReactNode;
}

export function Callout({ type = "note", children }: CalloutProps) {
  const Icon = type === "warning" ? TriangleAlert : Info;
  return (
    <div
      className={cn(
        "my-5 flex gap-3 rounded-lg border px-4 py-3 text-sm [&_p]:m-0",
        type === "warning" ? "border-warning/40 bg-warning-subtle text-warning-text" : "border-border bg-subtle",
      )}
    >
      <Icon className={cn("mt-1 size-4 shrink-0", type === "warning" ? "text-warning-text" : "text-accent")} aria-hidden />
      <div className="grid gap-2">{children}</div>
    </div>
  );
}
