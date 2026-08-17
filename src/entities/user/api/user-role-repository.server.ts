import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import type { UserRole } from "../model/types";

export async function addUserRole(userId: string, role: UserRole) {
  const { error } = await createSupabaseServerClient()
    .from("user_roles")
    .upsert({ user_id: userId, role });
  if (error) throw error;
}

export async function setActiveUserRole(userId: string, role: UserRole) {
  const supabase = createSupabaseServerClient();
  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle();
  if (roleError) throw roleError;
  if (!roleRow) throw new Error("This role is not enabled for the user");
  const { error } = await supabase
    .from("users")
    .update({ active_role: role })
    .eq("id", userId);
  if (error) throw error;
}

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = await createSupabaseServerClient()
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((item) => item.role as UserRole);
}
