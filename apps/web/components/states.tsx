"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CircleAlert, Inbox, RotateCw } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { StatePanel } from "@repo/ui/components/state-panel";
import { toServiceError } from "@/lib/services";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  retrying?: boolean;
  compact?: boolean;
  className?: string;
}

/** What happened + how to fix + retry. Never shows a bare error code. */
export function ErrorState({ error, onRetry, retrying, compact, className }: ErrorStateProps) {
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");
  const { code } = toServiceError(error);
  return (
    <StatePanel
      tone="error"
      icon={<CircleAlert />}
      title={t(`${code}.title`)}
      description={
        <>
          {t(`${code}.description`)}{" "}
          <span className="text-xs opacity-70">{t("reference", { code })}</span>
        </>
      }
      compact={compact}
      className={className}
    >
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry} disabled={retrying}>
          <RotateCw aria-hidden className={retrying ? "animate-spin" : undefined} />
          {tCommon("retry")}
        </Button>
      ) : null}
    </StatePanel>
  );
}

interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
  className?: string;
}

/** Instructional empty state: always pair with a concrete next action as children. */
export function EmptyState({ title, description, icon, children, compact, className }: EmptyStateProps) {
  return (
    <StatePanel
      icon={icon ?? <Inbox />}
      title={title}
      description={description}
      compact={compact}
      className={className}
    >
      {children}
    </StatePanel>
  );
}
