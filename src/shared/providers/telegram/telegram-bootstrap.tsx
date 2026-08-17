"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import {
  initializeTelegramWebApp,
  waitForTelegramWebApp,
} from "@/shared/lib/telegram/initialize-web-app";
import { useUserStore } from "@/entities/user/model/user-store";

export function TelegramBootstrap({ children }: PropsWithChildren) {
  const [isBootstrapped, setIsBootstrapped] = useState(
    () => useUserStore.getState().status === "ready",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let destroyTelegramWebApp: (() => void) | undefined;
    let active = true;

    void (async () => {
      try {
        await waitForTelegramWebApp();
        destroyTelegramWebApp = initializeTelegramWebApp();
        await useUserStore.getState().loadUser();
        if (active) setIsBootstrapped(true);
      } catch (caught) {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Profilni yuklab bo‘lmadi",
          );
        }
      }
    })();

    return () => {
      active = false;
      destroyTelegramWebApp?.();
    };
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
          {error ? (
            <p className="max-w-72 text-sm leading-6 text-destructive">
              {error}
            </p>
          ) : (
            <>
              <LoaderCircle className="size-5 animate-spin text-emerald-700" />
              <p className="text-sm text-muted-foreground">
                JobTop yuklanmoqda...
              </p>
            </>
          )}
        </div>
      </div>
    );

  return children;
}
