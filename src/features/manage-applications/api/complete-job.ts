import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";

export async function completeJob(jobId: string) {
  const initData = getTelegramInitData();
  if (!initData) throw new Error("Bu amal Telegram Mini App ichida ishlaydi");
  const response = await fetch(`/api/jobs/${jobId}/complete`, {
    method: "PATCH",
    headers: { "x-telegram-init-data": initData },
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Ishni yakunlab bo‘lmadi");
}
