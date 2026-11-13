import { Brand } from "@/components/brand";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-subtle">
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
        <Brand />
        <LocaleSwitcher />
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-4 py-12 md:items-center md:py-16">
        {children}
      </main>
    </div>
  );
}
