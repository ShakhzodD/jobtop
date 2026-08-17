import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { sendTelegramBotMessage } from "@/shared/lib/telegram/bot-api";

function parseUsernames(value: unknown) {
  if (!Array.isArray(value)) throw new Error("Sheriklar ro‘yxati kerak");
  const usernames = [...new Set(value)]
    .filter((username): username is string => typeof username === "string")
    .map((username) => username.trim().replace(/^@/, "").toLowerCase())
    .filter(Boolean);
  if (!usernames.length || usernames.length > 19)
    throw new Error("1 dan 19 tagacha sherik qo‘shing");
  if (usernames.some((username) => !/^[a-z0-9_]{5,32}$/.test(username)))
    throw new Error("Telegram username noto‘g‘ri yozilgan");
  return usernames;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (user.activeRole !== "worker")
      throw new Error("Guruh arizasi uchun ishchi rolini tanlang");
    const { jobId, usernames } = (await request.json()) as {
      jobId?: unknown;
      usernames?: unknown;
    };
    if (typeof jobId !== "string") throw new Error("E’lon topilmadi");
    const invitedUsernames = parseUsernames(usernames);
    const supabase = createSupabaseServerClient();

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, employer_id, status, openings")
      .eq("id", jobId)
      .maybeSingle();
    if (jobError) throw jobError;
    if (!job || job.status !== "published")
      throw new Error("Bu e’lon guruh arizasi uchun ochiq emas");
    if (job.employer_id === user.id)
      throw new Error("O‘z e’loningizga ariza bera olmaysiz");
    if (invitedUsernames.length + 1 > job.openings)
      throw new Error(`Bu e’lon uchun ko‘pi bilan ${job.openings} kishi kerak`);

    const { data: invitedUsers, error: usersError } = await supabase
      .from("users")
      .select("id, telegram_id, telegram_username")
      .in("telegram_username", invitedUsernames);
    if (usersError) throw usersError;
    if ((invitedUsers ?? []).length !== invitedUsernames.length)
      throw new Error("Ba’zi sheriklar JobTop’da ro‘yxatdan o‘tmagan");
    if (invitedUsers?.some(({ id }) => id === user.id))
      throw new Error("O‘zingizni sherik sifatida qo‘shmang");

    const { data: existing, error: existingError } = await supabase
      .from("group_applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("leader_id", user.id)
      .in("status", ["pending_members", "ready", "selected"])
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing)
      throw new Error("Bu e’lon uchun guruh arizangiz allaqachon bor");

    const { data: group, error: groupError } = await supabase
      .from("group_applications")
      .insert({
        job_id: jobId,
        leader_id: user.id,
        member_count: invitedUsernames.length + 1,
      })
      .select("id")
      .single();
    if (groupError) throw groupError;

    const members = [
      { group_application_id: group.id, user_id: user.id, status: "leader" },
      ...(invitedUsers ?? []).map((invitedUser) => ({
        group_application_id: group.id,
        user_id: invitedUser.id,
        status: "pending",
      })),
    ];
    const { error: membersError } = await supabase
      .from("group_application_members")
      .insert(members);
    if (membersError) throw membersError;

    await Promise.allSettled(
      (invitedUsers ?? []).map((invitedUser) =>
        sendTelegramBotMessage(
          invitedUser.telegram_id,
          `${user.fullName} sizni “${job.title}” e’loniga guruh bo‘lib ariza berishga taklif qildi.`,
          {
            inline_keyboard: [
              [
                {
                  text: "✅ Qatnashaman",
                  callback_data: `group:${group.id}:accept`,
                },
                {
                  text: "❌ Rad etish",
                  callback_data: `group:${group.id}:decline`,
                },
              ],
            ],
          },
        ),
      ),
    );

    return NextResponse.json(
      { groupApplication: { id: group.id } },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Guruh arizasini yuborib bo‘lmadi";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Telegram") ? 401 : 400 },
    );
  }
}
