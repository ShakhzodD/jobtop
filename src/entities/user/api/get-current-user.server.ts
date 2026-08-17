import type { NextRequest } from "next/server";
import { verifyTelegramInitData } from "@/shared/lib/telegram/validate-init-data";
import { upsertTelegramUser } from "./telegram-user-repository.server";

export async function getCurrentUserFromRequest(request: NextRequest) {
  const initData = request.headers.get("x-telegram-init-data");
  if (!initData) throw new Error("Telegram authorization is required");
  return upsertTelegramUser(verifyTelegramInitData(initData));
}
