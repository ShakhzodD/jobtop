"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { initializeTelegramWebApp } from "@/shared/lib/telegram/initialize-web-app";
import { useUserStore } from "@/entities/user/model/user-store";

export function TelegramBootstrap({ children }: PropsWithChildren) {
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    const destroyTelegramWebApp = initializeTelegramWebApp();

    void useUserStore
      .getState()
      .loadUser(true)
      .finally(() => setIsBootstrapped(true));

    return destroyTelegramWebApp;
  }, []);

  if (!isBootstrapped)
    return (
      <div className="grid min-h-[var(--jt-tg-viewport-stable-height,100dvh)] place-items-center bg-background px-6 text-center text-foreground">
        <div className="grid justify-items-center gap-3">
          <Image
            src="/jobtop-logo.png"
            alt="JobTop"
            width={48}
            height={48}
            className="size-12 rounded-2xl"
            priority
          />
          <LoaderCircle className="size-5 animate-spin text-emerald-700" />
          <p className="text-sm text-muted-foreground">JobTop yuklanmoqda...</p>
        </div>
      </div>
    );

  return children;
}
