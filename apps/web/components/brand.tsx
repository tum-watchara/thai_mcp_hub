import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { cn } from "@repo/ui/lib/utils";

/** Text wordmark. Name comes from config/site.ts so a rename touches one file. */
export function Brand({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-md text-[15px] font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <span
        aria-hidden
        className="inline-flex size-6 items-center justify-center rounded-md border border-foreground font-mono text-[11px] font-semibold"
      >
        TH
      </span>
      <span>{siteConfig.name}</span>
    </Link>
  );
}
