import { MarketingHeader } from "@/components/shells/marketing-header";
import { DocsSidebar } from "@/features/docs/components/docs-nav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <MarketingHeader />
      <div className="mx-auto flex max-w-7xl gap-8 px-4 md:px-6">
        <DocsSidebar />
        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
