import { useTranslations } from "next-intl";
import { McpPlaygroundDemo } from "./mcp-playground-demo";

export function PlaygroundSection() {
  const t = useTranslations("landing.playground");

  return (
    <section aria-labelledby="playground-section-title" className="border-t border-border bg-subtle px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 md:gap-10">
        <div className="grid max-w-2xl gap-3">
          <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-accent uppercase">{t("sectionEyebrow")}</p>
          <h2 id="playground-section-title" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{t("sectionTitle")}</h2>
          <p className="text-base leading-7 text-muted-foreground">{t("sectionDescription")}</p>
        </div>
        <div className="max-w-6xl"><McpPlaygroundDemo /></div>
      </div>
    </section>
  );
}
