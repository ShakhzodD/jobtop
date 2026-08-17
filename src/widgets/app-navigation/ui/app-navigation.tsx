"use client";

import { BriefcaseBusiness, ClipboardList, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "@bprogress/next/app";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", id: "jobs", icon: BriefcaseBusiness },
  { href: "/applications", id: "applications", icon: ClipboardList },
  { href: "/profile", id: "profile", icon: UserRound },
] as const;

export function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navigation");

  useEffect(() => {
    navigation.forEach(({ href }) => router.prefetch(href));
  }, [router]);

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-40 mx-auto grid w-full max-w-[540px] grid-cols-3 border-t border-border bg-card px-3 pt-2 pb-[calc(0.625rem+env(safe-area-inset-bottom)+var(--tg-safe-area-inset-bottom,0px)+var(--tg-content-safe-area-inset-bottom,0px)+var(--jt-tg-safe-bottom,0px))]"
      aria-label="Asosiy navigatsiya"
    >
      {navigation.map(({ href, id, icon: Icon }) => (
        <Button
          className={cn(
            "h-auto flex-col gap-1 rounded-xl py-1 text-[11px]",
            (href === "/" ? pathname === "/" : pathname.startsWith(href)) &&
              "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
          )}
          key={id}
          onClick={() => router.push(href)}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Icon className="size-4" />
          {t(id)}
        </Button>
      ))}
    </nav>
  );
}
