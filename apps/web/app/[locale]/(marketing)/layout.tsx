import { MarketingFooter } from "@/components/shells/marketing-footer";
import { MarketingHeader } from "@/components/shells/marketing-header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-surface flex min-h-dvh flex-col bg-background text-foreground">
      <MarketingHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
