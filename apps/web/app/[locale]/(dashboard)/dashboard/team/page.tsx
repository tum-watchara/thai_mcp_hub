import { TeamView } from "@/features/team/components/team-view";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("team");

export default function TeamPage() {
  return <TeamView />;
}
