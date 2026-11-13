import Image from "next/image";
import { cn } from "@repo/ui/lib/utils";

/** User-supplied brand SVGs. Adjacent text provides the accessible provider name. */
export function ProviderIcon({ provider, className }: { provider: "line" | "google"; className?: string }) {
  return <Image src={`/brands/${provider}.svg`} width={24} height={24} alt="" aria-hidden unoptimized className={cn("size-6 shrink-0 object-contain", className)} />;
}
