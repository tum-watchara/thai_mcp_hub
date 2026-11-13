import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { PricingFaq } from "@/features/marketing/components/pricing-faq";
import { PricingTable } from "@/features/marketing/components/pricing-table";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("pricing");

export default function PricingPage() {
  const t = useTranslations("pricing");
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:px-6 md:py-16">
      <PageHeader title={t("title")} description={t("description")} />
      <PricingTable />
      <div className="max-w-3xl">
        <PricingFaq />
      </div>
    </div>
  );
}
