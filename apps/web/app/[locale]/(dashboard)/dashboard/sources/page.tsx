import { SourcesView } from "@/features/sources/components/sources-view";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("sources");

export default function SourcesPage() {
  return <SourcesView />;
}
