import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { jobId, note } = await request.json() as { jobId?: unknown; note?: unknown };
    if (typeof jobId !== "string") return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    const user = await getCurrentUserFromRequest(request);
    if (user.activeRole !== "worker") return NextResponse.json({ error: "Ariza yuborish uchun ishchi rolini tanlang" }, { status: 400 });
    const supabase = createSupabaseServerClient();
    const { data: job, error: jobError } = await supabase.from("jobs").select("id, employer_id, status").eq("id", jobId).maybeSingle();
    if (jobError) throw jobError;
    if (!job || job.status !== "published") return NextResponse.json({ error: "Bu e’lon ariza uchun ochiq emas" }, { status: 409 });
    if (job.employer_id === user.id) return NextResponse.json({ error: "O‘z e’loningizga ariza bera olmaysiz" }, { status: 400 });

    const { data, error } = await supabase
      .from("applications")
      .insert({ job_id: jobId, worker_id: user.id, note: typeof note === "string" ? note.trim() || null : null })
      .select("id, status")
      .single();
    if (error?.code === "23505") return NextResponse.json({ error: "Siz bu e’longa allaqachon ariza yuborgansiz" }, { status: 409 });
    if (error) throw error;
    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ariza yuborib bo‘lmadi";
    return NextResponse.json({ error: message }, { status: message.includes("Telegram") ? 401 : 400 });
  }
}
