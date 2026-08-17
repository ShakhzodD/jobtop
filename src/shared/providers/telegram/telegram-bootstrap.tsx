"use client";

import { useEffect } from "react";
import { initializeTelegramWebApp } from "@/shared/lib/telegram/initialize-web-app";

export function TelegramBootstrap() {
  useEffect(() => {
    initializeTelegramWebApp();
  }, []);

  return null;
}
