"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { CopyButton } from "./copy-button";

interface CodeBlockProps {
  code: string;
  language?: string;
  /** Optional caption shown left of the language label, e.g. a file name. */
  title?: string;
  copyLabel: string;
  copiedLabel: string;
  onCopied?: () => void;
  className?: string;
  /** Wrap long lines instead of scrolling horizontally. */
  wrap?: boolean;
  maxHeight?: number;
}

export function CodeBlock({
  code,
  language,
  title,
  copyLabel,
  copiedLabel,
  onCopied,
  className,
  wrap = false,
  maxHeight,
}: CodeBlockProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-subtle", className)}>
      <div className="flex h-10 items-center justify-between gap-2 border-b border-border pr-1 pl-4">
        <span className="truncate font-mono text-xs text-muted-foreground">
          {title ?? language ?? "text"}
          {title && language ? <span className="ml-2 opacity-70">· {language}</span> : null}
        </span>
        <CopyButton value={code} label={copyLabel} copiedLabel={copiedLabel} onCopied={onCopied} />
      </div>
      <pre
        className={cn(
          "overflow-auto p-4 font-mono text-[13px] leading-relaxed text-foreground",
          wrap ? "break-words whitespace-pre-wrap" : "whitespace-pre",
        )}
        style={maxHeight ? { maxHeight } : undefined}
        tabIndex={0}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
