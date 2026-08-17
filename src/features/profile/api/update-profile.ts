import type { JobCategory } from "@/entities/job/model/types";
import type { CurrentUser } from "@/entities/user/model/types";
import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";

export type ProfileDraft = {
  fullName: string;
  avatarUrl?: string;
  birthDate?: string;
  district?: string;
  experienceYears?: string;
  about?: string;
  categories?: JobCategory[];
};

function getHeaders() {
  const initData = getTelegramInitData();
  if (!initData) throw new Error("Profil Telegram Mini App ichida saqlanadi");

  return { "x-telegram-init-data": initData };
}

export async function uploadProfileAvatar(file: File) {
  const formData = new FormData();
  formData.set("avatar", file);
  const response = await fetch("/api/me/avatar", {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });
  const body = (await response.json()) as { avatarUrl?: string; error?: string };
  if (!response.ok || !body.avatarUrl) {
    throw new Error(body.error ?? "Rasmni yuklab bo‘lmadi");
  }
  return body.avatarUrl;
}

export async function updateProfile(draft: ProfileDraft) {
  const response = await fetch("/api/me/profile", {
    method: "PATCH",
    headers: { "content-type": "application/json", ...getHeaders() },
    body: JSON.stringify(draft),
  });
  const body = (await response.json()) as { user?: CurrentUser; error?: string };
  if (!response.ok || !body.user) {
    throw new Error(body.error ?? "Profilni saqlab bo‘lmadi");
  }
  return body.user;
}
