import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, Wrench } from "lucide-react";
import { siteConfig } from "@/config/site";

const TOOL_INPUT = { juristic_id: siteConfig.sampleJuristicId };
const TOOL_OUTPUT = {
  juristic_id: siteConfig.sampleJuristicId,
  name_th: "บริษัท สยามบัญชีดิจิทัล จำกัด",
  status: "ยังดำเนินกิจการอยู่",
  registered_capital: 5000000,
  registered_date: "2018-03-14",
};

/** A static, real-looking Claude conversation rendered as UI (not an image). */
export function ConversationDemo() {
  const t = useTranslations("landing.demo");
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-card" aria-label={t("label")}>
      <figcaption className="flex h-10 items-center border-b border-border bg-subtle px-4 text-xs text-muted-foreground">
        {t("label")}
      </figcaption>
      <div className="grid gap-4 p-4 md:p-5">
        <div className="ml-auto max-w-[85%] rounded-lg bg-subtle px-3.5 py-2.5 text-sm">
          <span className="sr-only">{t("you")}: </span>
          {t("question", { id: siteConfig.sampleJuristicId })}
        </div>

        <div className="rounded-lg border border-border">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs text-muted-foreground">
            <Wrench className="size-3.5" aria-hidden />
            <span>{t("toolCall")}</span>
            <code className="font-mono text-[12px] text-foreground">dbd.company_lookup</code>
            <span className="ml-auto inline-flex items-center gap-1 tabular-nums">
              <Clock className="size-3" aria-hidden />
              {t("latency")}
            </span>
          </div>
          <pre className="overflow-x-auto px-3 py-2 font-mono text-[12px] leading-relaxed text-muted-foreground">
            {JSON.stringify(TOOL_INPUT)}
          </pre>
          <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">{t("toolResult")}</div>
          <pre className="overflow-x-auto px-3 pb-3 font-mono text-[12px] leading-relaxed text-foreground">
            {JSON.stringify(TOOL_OUTPUT, null, 2)}
          </pre>
        </div>

        <div className="grid gap-2 text-sm">
          <p className="text-xs font-medium text-muted-foreground">{t("assistant")}</p>
          <p className="leading-relaxed">{t("answer")}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-success" aria-hidden />
              {t("source")}
            </span>
            <span>{t("fetchedAt")}</span>
          </p>
        </div>
      </div>
    </figure>
  );
}
