"use client";

import { useTranslations } from "next-intl";
import { CodeBlock } from "@repo/ui/components/code-block";
import { CopyButton } from "@repo/ui/components/copy-button";
import { toast } from "@repo/ui/components/toaster";
import { cn } from "@repo/ui/lib/utils";

interface CopyFieldProps {
  value: string;
  /** Accessible name for the field. */
  label: string;
  className?: string;
  mono?: boolean;
}

/** A read-only value with a labelled copy button and toast feedback. */
export function CopyField({ value, label, className, mono = true }: CopyFieldProps) {
  const t = useTranslations("common");
  return (
    <div
      className={cn(
        "flex min-h-10 items-center gap-2 rounded-md border border-border-strong bg-subtle py-1 pr-1 pl-3",
        className,
      )}
    >
      <span
        aria-label={label}
        className={cn("min-w-0 flex-1 truncate text-sm text-foreground select-all", mono && "font-mono text-[13px]")}
        title={value}
      >
        {value}
      </span>
      <CopyButton
        value={value}
        label={t("copy")}
        copiedLabel={t("copied")}
        showLabel
        variant="secondary"
        onCopied={() => toast.success(t("copied"))}
        onCopyFailed={() => toast.error(t("copyFailed"))}
      />
    </div>
  );
}

/** CodeBlock with translated copy labels and toast feedback. */
export function AppCodeBlock(props: {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  wrap?: boolean;
  maxHeight?: number;
}) {
  const t = useTranslations("common");
  return (
    <CodeBlock
      {...props}
      copyLabel={t("copy")}
      copiedLabel={t("copied")}
      onCopied={() => toast.success(t("copied"))}
    />
  );
}
