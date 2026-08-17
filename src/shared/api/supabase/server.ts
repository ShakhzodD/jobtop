import { createClient } from "@supabase/supabase-js";

function getRequiredEnvironment(name: "SUPABASE_URL" | "SUPABASE_API_KEY") {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function createSupabaseServerClient() {
  return createClient(
    getRequiredEnvironment("SUPABASE_URL"),
    getRequiredEnvironment("SUPABASE_API_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
