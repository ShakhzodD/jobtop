import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import type { VerifiedTelegramUser } from "@/shared/lib/telegram/validate-init-data";
import type { CurrentUser } from "../model/types";
import type { JobCategory } from "@/entities/job/model/types";
import { getUserRoles } from "./user-role-repository.server";

export async function upsertTelegramUser(
  user: VerifiedTelegramUser,
): Promise<CurrentUser> {
  const supabase = createSupabaseServerClient();
  const fields =
    "id, telegram_id, full_name, telegram_username, avatar_url, phone, birth_date, district, experience_years, about, worker_categories, active_role";
  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select(fields)
    .eq("telegram_id", user.telegramId)
    .maybeSingle();

  if (existingUserError) throw existingUserError;

  const { data, error } = existingUser
    ? await supabase
        .from("users")
        .update({ telegram_username: user.username })
        .eq("id", existingUser.id)
        .select(fields)
        .single()
    : await supabase
        .from("users")
        .insert({
          telegram_id: user.telegramId,
          full_name: user.fullName,
          telegram_username: user.username,
          avatar_url: user.photoUrl,
        })
        .select(fields)
        .single();

  if (error) throw error;
  const roles = await getUserRoles(data.id);
  return {
    id: data.id,
    telegramId: data.telegram_id,
    fullName: data.full_name,
    telegramUsername: data.telegram_username,
    avatarUrl: data.avatar_url,
    phone: data.phone,
    birthDate: data.birth_date,
    district: data.district,
    experienceYears: data.experience_years,
    about: data.about,
    workerCategories: (data.worker_categories ?? []) as JobCategory[],
    activeRole: data.active_role,
    roles,
  };
}
