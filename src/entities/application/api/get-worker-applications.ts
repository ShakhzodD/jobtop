import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";
import type { WorkerApplication } from "../model/worker-application";

export async function getWorkerApplications(): Promise<WorkerApplication[]> {
  const initData = getTelegramInitData();
  if (!initData) throw new Error("Arizalar Telegram Mini App ichida yuklanadi");

  const response = await fetch("/api/applications", {
    headers: { "x-telegram-init-data": initData },
  });
  const body = (await response.json()) as {
    applications?: WorkerApplication[];
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "Arizalarni yuklab bo‘lmadi");
  return body.applications ?? [];
}
