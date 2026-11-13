import { useTranslations } from "next-intl";
import { Ban, Clock, KeyRound, ShieldCheck } from "lucide-react";
import type { CallClient, CallStatus, LicenseStatus, SourceStatus } from "@repo/schemas";
import { Badge } from "@repo/ui/components/badge";
import { StatusDot, type StatusTone } from "@repo/ui/components/status-dot";

const LICENSE_TONE = {
  commercial_ok: "success",
  pending_permission: "warning",
  byok: "neutral",
} as const satisfies Record<LicenseStatus, "success" | "warning" | "neutral">;

const LICENSE_ICON = {
  commercial_ok: ShieldCheck,
  pending_permission: Clock,
  byok: KeyRound,
} as const;

export function LicenseBadge({ status }: { status: LicenseStatus }) {
  const t = useTranslations("sourceMeta.license");
  const Icon = LICENSE_ICON[status];
  return (
    <Badge tone={LICENSE_TONE[status]}>
      <Icon aria-hidden />
      {t(status)}
    </Badge>
  );
}

const SOURCE_STATUS_TONE: Record<SourceStatus, StatusTone> = {
  operational: "success",
  degraded: "warning",
  down: "error",
};

export function SourceStatusLabel({ status }: { status: SourceStatus }) {
  const t = useTranslations("sourceMeta.status");
  return <StatusDot tone={SOURCE_STATUS_TONE[status]} label={t(status)} />;
}

const CALL_STATUS_TONE: Record<CallStatus, StatusTone> = {
  success: "success",
  error: "error",
  rate_limited: "warning",
};

export function CallStatusLabel({ status }: { status: CallStatus }) {
  const t = useTranslations("logs.status");
  return <StatusDot tone={CALL_STATUS_TONE[status]} label={t(status)} />;
}

export function ClientLabel({ client }: { client: CallClient }) {
  const t = useTranslations("clients");
  return <span>{t(client)}</span>;
}

export function ComingSoonBadge() {
  const t = useTranslations("common");
  return (
    <Badge tone="outline">
      <Ban aria-hidden />
      {t("comingSoon")}
    </Badge>
  );
}

/** Tool names, URLs and IDs always render in the mono face. */
export function ToolName({ name, className }: { name: string; className?: string }) {
  return <code className={`font-mono text-[13px] text-foreground ${className ?? ""}`}>{name}</code>;
}
