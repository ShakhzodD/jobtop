import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { sendTelegramBotMessage } from "@/shared/lib/telegram/bot-api";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const { jobId } = await params;
    const supabase = createSupabaseServerClient();
    const { data: job, error } = await supabase.from("jobs").select("employer_id, title, status").eq("id", jobId).maybeSingle();
    if (error) throw error;
    if (!job || job.employer_id !== user.id) return NextResponse.json({ error: "Ruxsat yo‘q" }, { status: 403 });
    if (job.status !== "filled" && job.status !== "published") throw new Error("Bu e’lon yakunlash uchun tayyor emas");
    const { error: updateError } = await supabase.from("jobs").update({ status: "completed" }).eq("id", jobId);
    if (updateError) throw updateError;
    const { data: workers } = await supabase.from("applications").select("worker:users!applications_worker_id_fkey(telegram_id)").eq("job_id", jobId).eq("status", "selected");
    void Promise.allSettled((workers ?? []).flatMap((item) => { const id = (item.worker as unknown as { telegram_id: number } | null)?.telegram_id; return id ? [sendTelegramBotMessage(id, `“${job.title}” ishi yakunlandi. Arizalar bo‘limidan qatnashganingizni tasdiqlab, ish beruvchiga baho bering.`)] : []; }));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ishni yakunlab bo‘lmadi" }, { status: 400 });
  }
}
