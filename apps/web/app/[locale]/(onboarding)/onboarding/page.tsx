import { OnboardingFlow } from "@/features/onboarding/components/onboarding-flow";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("onboarding");

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
