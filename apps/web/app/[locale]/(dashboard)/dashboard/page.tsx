import { OverviewView } from "@/features/overview/components/overview-view";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("overview");

export default function OverviewPage() {
  return <OverviewView />;
}
