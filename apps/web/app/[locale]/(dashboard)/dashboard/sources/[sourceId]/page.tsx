import { SourceDetailView } from "@/features/sources/components/source-detail-view";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("sources");

export default async function SourceDetailPage({ params }: { params: Promise<{ locale: string; sourceId: string }> }) {
  const { sourceId } = await params;
  return <SourceDetailView sourceId={sourceId} />;
}
