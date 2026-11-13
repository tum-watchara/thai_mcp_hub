"use client";

import { useTranslations } from "next-intl";
import type { ToolInputSchema } from "@repo/schemas";
import { useLocalized } from "@/lib/utils/format";

/** Input schema rendered as a readable parameter list. */
export function ToolParams({ schema }: { schema: ToolInputSchema }) {
  const t = useTranslations("docs.toolReference");
  const localized = useLocalized();
  const entries = Object.entries(schema.properties);

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noParams")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th scope="col" className="py-2 pr-4 font-medium">
              {t("name")}
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              {t("type")}
            </th>
            <th scope="col" className="py-2 font-medium">
              {t("description")}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, param]) => {
            const required = schema.required.includes(name);
            return (
              <tr key={name} className="border-b border-border align-top last:border-0">
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  <code className="font-mono text-[13px]">{name}</code>
                  {required ? <span className="ml-1.5 text-xs text-error-text">{t("required")}</span> : null}
                </td>
                <td className="py-2.5 pr-4 font-mono text-[13px] whitespace-nowrap text-muted-foreground">
                  {param.enum ? param.enum.map((value) => `"${value}"`).join(" | ") : param.type}
                </td>
                <td className="py-2.5 text-muted-foreground">{localized(param.description)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
