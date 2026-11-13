"use client";

import { useTranslations } from "next-intl";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ProviderIcon } from "@/components/provider-icon";
import { useRouter } from "@/i18n/navigation";
import { useCurrentUserQuery } from "@/lib/query/workspace";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("");
}

export function UserMenu() {
  const t = useTranslations("shell");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const user = useCurrentUserQuery();

  if (user.isPending) return <Skeleton className="size-9 rounded-full" />;
  const name = user.data?.name ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t("userMenu")}>
          <span className="inline-flex size-8 items-center justify-center rounded-full border border-border-strong bg-subtle text-xs font-medium">
            {initials(name)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {user.data ? (
          <DropdownMenuLabel className="grid gap-0.5 py-2">
            <span className="text-sm font-medium text-foreground">{user.data.name}</span>
            <span className="truncate font-normal">{user.data.email}</span>
            <span className="flex items-center gap-2 font-normal">
              <ProviderIcon provider={user.data.provider} className="size-4" />
              {t("signedInWith", { provider: user.data.provider === "line" ? "LINE" : "Google" })}
            </span>
          </DropdownMenuLabel>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/dashboard/settings")}>
          <Settings aria-hidden />
          {tNav("settings")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/login")}>
          <LogOut aria-hidden />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
