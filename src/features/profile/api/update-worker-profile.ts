import type { CurrentUser } from "@/entities/user/model/types";
import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";

export type WorkerProfileDraft = {
  birthDate: string;
  district: string;
  experienceYears: string;
  about: string;
};

export async function updateWorkerProfile(draft: WorkerProfileDraft) {
  const initData = getTelegramInitData();
  if (!initData) throw new Error("Profil Telegram Mini App ichida saqlanadi");

  const response = await fetch("/api/me/profile", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-telegram-init-data": initData,
    },
    body: JSON.stringify(draft),
  });
  const body = (await response.json()) as {
    user?: CurrentUser;
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "Profilni saqlab bo‘lmadi");
  return body.user!;
}
