"use client";

import { BriefcaseBusiness, ClipboardList, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
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

  return (
    <nav className="jt-nav" aria-label="Asosiy navigatsiya">
      {navigation.map(({ href, id, icon: Icon }) => (
        <Button
          className={cn("h-auto flex-col gap-1 rounded-xl py-1 text-[11px]", (href === "/" ? pathname === "/" : pathname.startsWith(href)) && "bg-emerald-50 text-emerald-700 hover:bg-emerald-50")}
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
