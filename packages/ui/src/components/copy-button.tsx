"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { useCopy } from "../hooks/use-copy";
import { cn } from "../lib/utils";
import { Button, type ButtonProps } from "./button";

interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  value: string;
  /** Translated labels — the UI package carries no copy of its own. */
  label: string;
  copiedLabel: string;
  /** Show the label next to the icon. */
  showLabel?: boolean;
  onCopied?: () => void;
  onCopyFailed?: () => void;
}

export function CopyButton({
  value,
  label,
  copiedLabel,
  showLabel = false,
  onCopied,
  onCopyFailed,
  className,
  variant = "ghost",
  size,
  ...props
}: CopyButtonProps) {
  const { copied, copy } = useCopy();
  return (
    <Button
      variant={variant}
      size={size ?? (showLabel ? "sm" : "icon-sm")}
      className={cn(copied && "text-success-text", className)}
      aria-label={showLabel ? undefined : copied ? copiedLabel : label}
      onClick={async () => {
        const ok = await copy(value);
        if (ok) onCopied?.();
        else onCopyFailed?.();
      }}
      {...props}
    >
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      {showLabel ? <span>{copied ? copiedLabel : label}</span> : null}
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </Button>
  );
}
