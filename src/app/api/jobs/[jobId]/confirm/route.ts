import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const { jobId } = await params;
    const supabase = createSupabaseServerClient();
    const { data: application } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("worker_id", user.id)
      .eq("status", "selected")
      .maybeSingle();
    if (!application)
      return NextResponse.json(
        { error: "Bu ish uchun tanlanmagansiz" },
        { status: 403 },
      );
    const { error } = await supabase
      .from("job_participant_confirmations")
      .upsert({ job_id: jobId, user_id: user.id });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Tasdiqlab bo‘lmadi" },
      { status: 400 },
    );
  }
}
