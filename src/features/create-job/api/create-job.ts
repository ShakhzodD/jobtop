import type { JobDraft } from "../model/validate-job-draft";
import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";

export async function createJob(draft: JobDraft) {
  const initData = getTelegramInitData();
  if (!initData)
    throw new Error("E’lon berish Telegram Mini App ichida ishlaydi");
  const response = await fetch("/api/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-telegram-init-data": initData,
    },
    body: JSON.stringify(draft),
  });
  const body = (await response.json()) as {
    job?: { id: string; status: string };
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "E’lon yaratib bo‘lmadi");
  return body.job!;
}
