"use client";

import { useEffect } from "react";
import { initializeTelegramWebApp } from "@/shared/lib/telegram/initialize-web-app";
import { useUserStore } from "@/entities/user/model/user-store";

export function TelegramBootstrap() {
  useEffect(() => {
    initializeTelegramWebApp();
    void useUserStore.getState().loadUser(true);
  }, []);

  return null;
}
