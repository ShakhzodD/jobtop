import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramInitData } from "@/shared/lib/telegram/validate-init-data";
import { upsertTelegramUser } from "@/entities/user/api/telegram-user-repository.server";

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json() as { initData?: unknown };
    if (typeof initData !== "string") return NextResponse.json({ error: "initData is required" }, { status: 400 });
    return NextResponse.json({ user: await upsertTelegramUser(verifyTelegramInitData(initData)) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to authenticate";
    return NextResponse.json({ error: message }, { status: message.includes("configured") ? 503 : 401 });
  }
}
