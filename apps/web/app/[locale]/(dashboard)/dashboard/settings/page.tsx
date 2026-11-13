import { SettingsView } from "@/features/settings/components/settings-view";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("settings");

export default function SettingsPage() {
  return <SettingsView />;
}
