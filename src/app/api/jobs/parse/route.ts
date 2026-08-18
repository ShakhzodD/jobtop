import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { parseExternalJobWithGemini } from "@/features/ai-job-import/api/gemini-job-parser.server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const [user, body] = await Promise.all([
      getCurrentUserFromRequest(request),
      request.json() as Promise<{ text?: unknown }>,
    ]);
    if (user.activeRole !== "employer") {
      return NextResponse.json(
        { error: "E’lon berish uchun ish beruvchi roli kerak" },
        { status: 403 },
      );
    }

    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (text.length < 20) {
      return NextResponse.json(
        { error: "E’lon haqida kamida bir nechta gap yozing" },
        { status: 400 },
      );
    }
    if (text.length > 4_000) {
      return NextResponse.json(
        { error: "E’lon matni 4000 belgidan oshmasin" },
        { status: 400 },
      );
    }

    const parsed = await parseExternalJobWithGemini(
      "JobTop ish beruvchisi",
      text,
    );
    if (!parsed.isVacancy) {
      return NextResponse.json(
        { error: "Bu matnda ish e’loni aniqlanmadi" },
        { status: 400 },
      );
    }
    return NextResponse.json({ job: parsed });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Matnni tahlil qilib bo‘lmadi";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Telegram") ? 401 : 400 },
    );
  }
}
