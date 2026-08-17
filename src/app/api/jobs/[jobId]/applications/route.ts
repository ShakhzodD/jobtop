import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const { jobId } = await params;
    const supabase = createSupabaseServerClient();
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("employer_id")
      .eq("id", jobId)
      .maybeSingle();
    if (jobError) throw jobError;
    if (!job || job.employer_id !== user.id)
      return NextResponse.json({ error: "Ruxsat yo‘q" }, { status: 403 });
    const { data, error } = await supabase
      .from("applications")
      .select(
        "id, status, note, created_at, worker:users!applications_worker_id_fkey(id, full_name, telegram_username, district, birth_date, experience_years, about)",
      )
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ applications: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Arizalarni yuklab bo‘lmadi";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Telegram") ? 401 : 400 },
    );
  }
}
