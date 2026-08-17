import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import type { VerifiedTelegramUser } from "@/shared/lib/telegram/validate-init-data";
import type { CurrentUser } from "../model/types";
import { getUserRoles } from "./user-role-repository.server";

export async function upsertTelegramUser(user: VerifiedTelegramUser): Promise<CurrentUser> {
  const { data, error } = await createSupabaseServerClient()
    .from("users")
    .upsert({ telegram_id: user.telegramId, full_name: user.fullName, telegram_username: user.username, avatar_url: user.photoUrl }, { onConflict: "telegram_id" })
    .select("id, telegram_id, full_name, telegram_username, phone, active_role")
    .single();

  if (error) throw error;
  const roles = await getUserRoles(data.id);
  return { id: data.id, telegramId: data.telegram_id, fullName: data.full_name, telegramUsername: data.telegram_username, phone: data.phone, activeRole: data.active_role, roles };
}
