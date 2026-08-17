"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale = locale === "uz" ? "ru" : "uz";

  return (
    <Button
      aria-label="Tilni o‘zgartirish"
      className="h-8 rounded-xl text-xs"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      size="sm"
      variant="outline"
    >
      <Languages /> {locale.toUpperCase()}
    </Button>
  );
}
