import { UsageView } from "@/features/usage/components/usage-view";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("usage");

export default function UsagePage() {
  return <UsageView />;
}
