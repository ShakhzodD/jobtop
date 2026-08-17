import type { ModerationJob } from "@/entities/job/model/types";
import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";

function getTelegramHeaders() {
  const initData = getTelegramInitData();
  if (!initData) {
    throw new Error("Moderatsiya Telegram Mini App ichida ishlaydi");
  }

  return { "x-telegram-init-data": initData };
}

export async function getPendingJobs(): Promise<ModerationJob[]> {
  const response = await fetch("/api/admin/jobs", {
    cache: "no-store",
    headers: getTelegramHeaders(),
  });
  const body = (await response.json()) as {
    jobs?: ModerationJob[];
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "E’lonlarni yuklab bo‘lmadi");
  return body.jobs ?? [];
}

export async function moderateJob(jobId: string, action: "publish" | "reject") {
  const response = await fetch(`/api/admin/jobs/${jobId}/${action}`, {
    method: "PATCH",
    headers: getTelegramHeaders(),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Moderatsiya bajarilmadi");
}
