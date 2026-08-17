import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { isTelegramAdmin } from "@/shared/lib/admin/is-telegram-admin";
import { sendTelegramBotMessage } from "@/shared/lib/telegram/bot-api";
import type { JobCategory } from "@/entities/job/model/types";

type Context = { params: Promise<{ jobId: string }> };

function getJobUrl(jobId: string) {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "https://jobtop-weld.vercel.app"
  ).replace(/\/$/, "");
  return `${appUrl}/uz?job=${encodeURIComponent(jobId)}`;
}

async function notifyMatchingWorkers(job: {
  id: string;
  category: JobCategory;
  title: string;
  district: string;
  payAmount: number;
}) {
  const supabase = createSupabaseServerClient();
  const { data: workerRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "worker");
  if (rolesError) throw rolesError;

  const workerIds = (workerRoles ?? []).map(({ user_id }) => user_id);
  if (!workerIds.length) return;

  const { data: workers, error: workersError } = await supabase
    .from("users")
    .select("telegram_id")
    .in("id", workerIds)
    .contains("worker_categories", [job.category]);
  if (workersError) throw workersError;

  const text = [
    "Sizga mos yangi ish chiqdi! 👷",
    "",
    `📌 ${job.title}`,
    `📍 ${job.district}`,
    `💰 ${job.payAmount.toLocaleString("uz-UZ")} so‘m`,
  ].join("\n");
  const replyMarkup = {
    inline_keyboard: [
      [{ text: "E’lonni ko‘rish", web_app: { url: getJobUrl(job.id) } }],
    ],
  };

  await Promise.allSettled(
    (workers ?? []).map(({ telegram_id }) =>
      sendTelegramBotMessage(telegram_id, text, replyMarkup),
    ),
  );
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!isTelegramAdmin(user.telegramId))
      return NextResponse.json(
        { error: "Admin ruxsati kerak" },
        { status: 403 },
      );
    const { jobId } = await context.params;
    const { data, error } = await createSupabaseServerClient()
      .from("jobs")
      .update({ status: "published" })
      .eq("id", jobId)
      .eq("status", "pending_moderation")
      .select("id, status, category, title, district, pay_amount")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return NextResponse.json(
        { error: "Tasdiqlanadigan e’lon topilmadi" },
        { status: 404 },
      );
    await notifyMatchingWorkers({
      id: data.id,
      category: data.category as JobCategory,
      title: data.title,
      district: data.district,
      payAmount: data.pay_amount,
    }).catch((notificationError) =>
      console.error("Unable to notify matching workers", notificationError),
    );
    return NextResponse.json({ job: data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "E’lonni tasdiqlab bo‘lmadi",
      },
      { status: 400 },
    );
  }
}
