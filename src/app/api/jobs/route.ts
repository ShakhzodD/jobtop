import { NextResponse } from "next/server";
import { getPublishedJobsPage } from "@/entities/job/api/published-job-repository.server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { parseJobDraft } from "@/features/create-job/model/validate-job-draft";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { getTelegramAdminIds } from "@/shared/lib/admin/is-telegram-admin";
import { sendTelegramBotMessage } from "@/shared/lib/telegram/bot-api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function notifyAdminsAboutNewJob(job: {
  id: string;
  category: string;
  title: string;
  district: string;
  openings: number;
  payAmount: number;
  employerName: string;
}) {
  const adminIds = getTelegramAdminIds();
  if (!adminIds.length) return;

  const text = [
    "🆕 Moderatsiya uchun yangi e’lon",
    "",
    `📌 ${job.title}`,
    `🏷 ${job.category}`,
    `👤 Ish beruvchi: ${job.employerName}`,
    `📍 ${job.district}`,
    `👥 Kerakli ishchi: ${job.openings}`,
    `💰 ${job.payAmount.toLocaleString("uz-UZ")} so‘m`,
  ].join("\n");
  const replyMarkup = {
    inline_keyboard: [
      [
        { text: "✅ Tasdiqlash", callback_data: `moderation:${job.id}:publish` },
        { text: "✕ Rad etish", callback_data: `moderation:${job.id}:reject` },
      ],
    ],
  };

  await Promise.allSettled(
    adminIds.map((telegramId) =>
      sendTelegramBotMessage(telegramId, text, replyMarkup),
    ),
  );
}

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(
      Math.max(Number(request.nextUrl.searchParams.get("limit")) || 10, 1),
      30,
    );
    return NextResponse.json(
      await getPublishedJobsPage(
        request.nextUrl.searchParams.get("cursor"),
        limit,
      ),
    );
  } catch {
    return NextResponse.json(
      { error: "Jobs are temporarily unavailable" },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const [user, draft] = await Promise.all([
      getCurrentUserFromRequest(request),
      request.json().then(parseJobDraft),
    ]);
    if (user.activeRole !== "employer")
      throw new Error("E’lon berish uchun ish beruvchi rolini tanlang");
    const { data, error } = await createSupabaseServerClient()
      .from("jobs")
      .insert({
        employer_id: user.id,
        category: draft.category,
        title: draft.title,
        description: draft.description,
        district: draft.district,
        address: draft.address,
        starts_at: draft.startsAt,
        ends_at: draft.endsAt,
        pay_amount: draft.payAmount,
        openings: draft.openings,
        status: "pending_moderation",
      })
      .select("id, status")
      .single();
    if (error) throw error;
    await notifyAdminsAboutNewJob({
      id: data.id,
      category: draft.category,
      title: draft.title,
      district: draft.district,
      openings: draft.openings,
      payAmount: draft.payAmount,
      employerName: user.fullName,
    }).catch((notificationError) =>
      console.error("Unable to notify admins about new job", notificationError),
    );
    return NextResponse.json({ job: data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create job";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Telegram") ? 401 : 400 },
    );
  }
}
