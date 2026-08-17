import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";

export async function selectWorker(applicationId: string) {
  const initData = getTelegramInitData();
  if (!initData)
    throw new Error("Nomzod tanlash Telegram Mini App ichida ishlaydi");
  const response = await fetch(`/api/applications/${applicationId}`, {
    method: "PATCH",
    headers: { "x-telegram-init-data": initData },
  });
  const body = (await response.json()) as {
    application?: { id: string; status: string };
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "Nomzodni tanlab bo‘lmadi");
  return body.application!;
}
