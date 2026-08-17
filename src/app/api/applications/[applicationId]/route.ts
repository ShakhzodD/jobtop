import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { sendTelegramBotMessage } from "@/shared/lib/telegram/bot-api";

type ApplicationWithJob = {
  id: string;
  job_id: string;
  status: string;
  jobs: { employer_id: string; openings: number; title: string } | null;
  worker: { telegram_id: number; phone: string | null } | null;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const { applicationId } = await params;
    const supabase = createSupabaseServerClient();
    const { data: rawApplication, error: applicationError } = await supabase
      .from("applications")
      .select(
        "id, job_id, status, jobs!applications_job_id_fkey(employer_id, openings, title), worker:users!applications_worker_id_fkey(telegram_id, phone)",
      )
      .eq("id", applicationId)
      .maybeSingle();
    if (applicationError) throw applicationError;
    const application = rawApplication as unknown as ApplicationWithJob | null;
    if (!application || application.jobs?.employer_id !== user.id)
      return NextResponse.json({ error: "Ruxsat yo‘q" }, { status: 403 });
    if (application.status === "selected")
      return NextResponse.json({
        application: {
          id: application.id,
          status: "selected",
          phone: application.worker?.phone ?? null,
        },
      });

    const { count, error: countError } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", application.job_id)
      .eq("status", "selected");
    if (countError) throw countError;
    if ((count ?? 0) >= application.jobs.openings)
      return NextResponse.json(
        { error: "Bu e’lon uchun ishchilar soni to‘lgan" },
        { status: 409 },
      );

    const { data, error } = await supabase
      .from("applications")
      .update({ status: "selected" })
      .eq("id", application.id)
      .select("id, status")
      .single();
    if (error) throw error;
    if ((count ?? 0) + 1 >= application.jobs.openings)
      await supabase
        .from("jobs")
        .update({ status: "filled" })
        .eq("id", application.job_id);

    const notifications = [
      sendTelegramBotMessage(
        user.telegramId,
        `“${application.jobs.title}” e’loni uchun ishchi tanlandi.`,
      ),
    ];
    if (application.worker?.telegram_id) {
      notifications.push(
        sendTelegramBotMessage(
          application.worker.telegram_id,
          `Tabriklaymiz! Siz “${application.jobs.title}” e’loni uchun tanlandingiz. Ish beruvchi tez orada siz bilan bog‘lanadi.`,
        ),
      );
    }
    void Promise.all(notifications).catch(() => undefined);

    return NextResponse.json({
      application: { ...data, phone: application.worker?.phone ?? null },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nomzod tanlab bo‘lmadi";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Telegram") ? 401 : 400 },
    );
  }
}
