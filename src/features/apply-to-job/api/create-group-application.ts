import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";

export async function createGroupApplication(
  jobId: string,
  usernames: string[],
) {
  const initData = getTelegramInitData();
  if (!initData)
    throw new Error("Guruh arizasi Telegram Mini App ichida ishlaydi");
  const response = await fetch("/api/group-applications", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-telegram-init-data": initData,
    },
    body: JSON.stringify({ jobId, usernames }),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok)
    throw new Error(body.error ?? "Guruh arizasini yuborib bo‘lmadi");
}
