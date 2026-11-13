import { useTranslations } from "next-intl";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Brand } from "@/components/brand";
import { Link } from "@/i18n/navigation";

export function NotFoundView() {
  const t = useTranslations("errors.notFoundPage");
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center border-b border-border px-4 md:px-6">
        <Brand />
      </header>
      <main id="main" className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-4 py-16">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/" className={buttonVariants({ variant: "primary" })}>
            {t("home")}
          </Link>
          <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
            {t("dashboard")}
          </Link>
        </div>
      </main>
    </div>
  );
}
