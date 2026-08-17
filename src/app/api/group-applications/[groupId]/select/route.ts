import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { sendTelegramBotMessage } from "@/shared/lib/telegram/bot-api";

type Context = { params: Promise<{ groupId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const { groupId } = await context.params;
    const supabase = createSupabaseServerClient();
    const { data: group, error } = await supabase
      .from("group_applications")
      .select(
        "id, job_id, status, member_count, jobs!group_applications_job_id_fkey(employer_id, openings, title)",
      )
      .eq("id", groupId)
      .maybeSingle();
    if (error) throw error;
    const job = group?.jobs as unknown as {
      employer_id: string;
      openings: number;
      title: string;
    } | null;
    if (!group || job?.employer_id !== user.id)
      return NextResponse.json({ error: "Ruxsat yo‘q" }, { status: 403 });
    if (group.status !== "ready")
      throw new Error("Guruhning barcha a’zolari hali tasdiqlamagan");

    const [
      { count: individualCount, error: individualError },
      { data: selectedGroups, error: groupsError },
    ] = await Promise.all([
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("job_id", group.job_id)
        .eq("status", "selected"),
      supabase
        .from("group_applications")
        .select("member_count")
        .eq("job_id", group.job_id)
        .eq("status", "selected"),
    ]);
    if (individualError || groupsError) throw individualError ?? groupsError;
    const selectedCount =
      (individualCount ?? 0) +
      (selectedGroups ?? []).reduce((sum, item) => sum + item.member_count, 0);
    if (selectedCount + group.member_count > job.openings)
      throw new Error("E’londa guruh uchun yetarli bo‘sh joy qolmagan");

    const { error: updateError } = await supabase
      .from("group_applications")
      .update({ status: "selected" })
      .eq("id", group.id)
      .eq("status", "ready");
    if (updateError) throw updateError;
    if (selectedCount + group.member_count >= job.openings)
      await supabase
        .from("jobs")
        .update({ status: "filled" })
        .eq("id", group.job_id);

    const { data: members } = await supabase
      .from("group_application_members")
      .select("user:users!group_application_members_user_id_fkey(telegram_id)")
      .eq("group_application_id", group.id);
    void Promise.allSettled(
      (members ?? []).flatMap((member) => {
        const telegramId = (
          member.user as unknown as { telegram_id: number } | null
        )?.telegram_id;
        return telegramId
          ? [
              sendTelegramBotMessage(
                telegramId,
                `Tabriklaymiz! Sizning guruhingiz “${job.title}” e’loni uchun tanlandi.`,
              ),
            ]
          : [];
      }),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Guruhni tanlab bo‘lmadi",
      },
      { status: 400 },
    );
  }
}
