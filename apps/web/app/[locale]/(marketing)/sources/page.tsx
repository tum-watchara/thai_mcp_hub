import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { CatalogList } from "@/features/marketing/components/catalog-list";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("catalog");

export default function CatalogPage() {
  const t = useTranslations("catalog");
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:px-6 md:py-16">
      <PageHeader title={t("title")} description={t("description")} />
      <CatalogList />
    </div>
  );
}
