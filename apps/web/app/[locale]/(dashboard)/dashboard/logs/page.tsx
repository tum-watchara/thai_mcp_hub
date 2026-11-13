import { LogsView } from "@/features/logs/components/logs-view";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("logs");

export default function LogsPage() {
  return <LogsView />;
}
