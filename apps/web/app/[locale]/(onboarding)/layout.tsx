import { useTranslations } from "next-intl";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Brand } from "@/components/brand";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("onboarding");
  return (
    <div className="flex min-h-dvh flex-col bg-subtle">
      <header className="flex h-14 items-center justify-between gap-2 border-b border-border bg-background px-4 md:px-6">
        <Brand href="/dashboard" />
        <div className="flex items-center gap-1">
          <LocaleSwitcher compact />
          <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            {t("skip")}
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
