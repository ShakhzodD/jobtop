import type { JobCategory } from "@/entities/job/model/types";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { sendTelegramBotMessage } from "@/shared/lib/telegram/bot-api";

type ModerationAction = "publish" | "reject";

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

export async function moderatePendingJob(
  jobId: string,
  action: ModerationAction,
) {
  const status = action === "publish" ? "published" : "cancelled";
  const { data, error } = await createSupabaseServerClient()
    .from("jobs")
    .update({ status })
    .eq("id", jobId)
    .eq("status", "pending_moderation")
    .select("id, status, category, title, district, pay_amount")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Bu e’lon allaqachon moderatsiya qilingan");

  if (action === "publish") {
    await notifyMatchingWorkers({
      id: data.id,
      category: data.category as JobCategory,
      title: data.title,
      district: data.district,
      payAmount: data.pay_amount,
    }).catch((notificationError) =>
      console.error("Unable to notify matching workers", notificationError),
    );
  }

  return data;
}
