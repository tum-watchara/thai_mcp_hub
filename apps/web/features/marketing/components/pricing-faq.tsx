"use client";

import { useTranslations } from "next-intl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/components/accordion";

const QUESTIONS = ["count", "overQuota", "byok", "data", "selfHost", "invoice"] as const;

export function PricingFaq() {
  const t = useTranslations("pricing");
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">{t("faqTitle")}</h2>
      <Accordion type="multiple" className="border-t border-border">
        {QUESTIONS.map((key) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger>{t(`faq.${key}.q`)}</AccordionTrigger>
            <AccordionContent>{t(`faq.${key}.a`)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
