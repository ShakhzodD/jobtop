import { createClient } from "@supabase/supabase-js";

function getRequiredEnvironment(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SECRET_KEY") {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function createSupabaseServerClient() {
  return createClient(
    getRequiredEnvironment("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnvironment("SUPABASE_SECRET_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
