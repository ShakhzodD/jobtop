import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";

export async function createApplication(jobId: string) {
  const initData = getTelegramInitData();
  if (!initData)
    throw new Error("Ariza yuborish Telegram Mini App ichida ishlaydi");
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-telegram-init-data": initData,
    },
    body: JSON.stringify({ jobId }),
  });
  const body = (await response.json()) as {
    application?: { id: string };
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "Ariza yuborib bo‘lmadi");
  return body.application!;
}
