import { CatalogDetail } from "@/features/marketing/components/catalog-detail";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("catalog");

export default async function CatalogDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <CatalogDetail sourceId={id} />
    </div>
  );
}
