import { LoginCard } from "@/features/onboarding/components/login-card";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("login");

export default function LoginPage() {
  return <LoginCard />;
}
