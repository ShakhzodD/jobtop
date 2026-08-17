import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";
import type { CurrentUser, UserRole } from "../model/types";

async function requestProfile(options?: RequestInit) {
  const initData = getTelegramInitData();
  if (!initData) throw new Error("Telegram authorization is required");
  const response = await fetch("/api/me/role", {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-telegram-init-data": initData,
      ...options?.headers,
    },
  });
  const body = (await response.json()) as {
    user?: CurrentUser;
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "Unable to load profile");
  return body;
}

export async function getCurrentUser() {
  return (await requestProfile()).user!;
}

export async function updateCurrentUserRole(role: UserRole, addRole = false) {
  await requestProfile({
    method: "PUT",
    body: JSON.stringify({ role, addRole }),
  });
}
