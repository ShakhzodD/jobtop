import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import {
  answerTelegramCallbackQuery,
  isValidTelegramWebhookSecret,
  sendTelegramBotMessage,
} from "@/shared/lib/telegram/bot-api";
import { moderatePendingJob } from "@/features/moderate-job/api/moderate-pending-job.server";
import { isTelegramAdmin } from "@/shared/lib/admin/is-telegram-admin";
import {
  addUserRole,
  setActiveUserRole,
} from "@/entities/user/api/user-role-repository.server";
import { importExternalJob } from "@/features/ai-job-import/api/import-external-job.server";

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

type TelegramMessage = {
  chat: {
    id: number;
    type?: string;
    username?: string;
    title?: string;
  };
  from?: TelegramUser;
  text?: string;
  caption?: string;
  message_id?: number;
  contact?: { phone_number: string; user_id?: number };
};

type TelegramCallback = {
  id: string;
  data?: string;
  from: TelegramUser;
  message?: TelegramMessage;
};
type TelegramUpdate = {
  message?: TelegramMessage;
  channel_post?: TelegramMessage;
  callback_query?: TelegramCallback;
};

const roleKeyboard = {
  inline_keyboard: [
    [
      { text: "👷 Ishchi", callback_data: "role:worker" },
      { text: "💼 Ish beruvchi", callback_data: "role:employer" },
    ],
  ],
};

const contactKeyboard = {
  keyboard: [[{ text: "📱 Telefon raqamni yuborish", request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
};

const removeKeyboard = { remove_keyboard: true };

const appUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://jobtop-weld.vercel.app"
).replace(/\/$/, "");

const openAppKeyboard = {
  inline_keyboard: [
    [{ text: "🚀 Platformaga kirish", web_app: { url: `${appUrl}/uz` } }],
  ],
};

function fullName(user: TelegramUser) {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    "JobTop foydalanuvchisi"
  );
}

function getAllowedImportChannelUsernames() {
  return new Set(
    (process.env.AI_IMPORT_CHANNEL_USERNAMES ?? "")
      .split(",")
      .map((username) => username.trim().replace(/^@/, "").toLowerCase())
      .filter(Boolean),
  );
}

async function handleChannelPost(post: TelegramMessage) {
  const username = post.chat.username?.toLowerCase();
  const text = post.text?.trim() || post.caption?.trim();
  if (!username || !text || !post.message_id) return;
  if (!getAllowedImportChannelUsernames().has(username)) return;

  const channelUrl = `https://t.me/${username}`;
  try {
    const result = await importExternalJob(
      { name: `@${username}`, url: channelUrl },
      {
        externalId: `${post.chat.id}:${post.message_id}`,
        url: `${channelUrl}/${post.message_id}`,
        text,
      },
    );
    console.info("Telegram channel post import finished", {
      channel: username,
      messageId: post.message_id,
      result,
    });
  } catch (error) {
    console.error("Telegram channel post import failed", {
      channel: username,
      messageId: post.message_id,
      error,
    });
  }
}

async function registerContact(user: TelegramUser, phone: string) {
  const { error } = await createSupabaseServerClient()
    .from("users")
    .upsert(
      {
        telegram_id: user.id,
        full_name: fullName(user),
        telegram_username: user.username ?? null,
        phone,
      },
      { onConflict: "telegram_id" },
    );

  if (error) throw error;
}

async function isRegistered(telegramId: number) {
  const { data, error } = await createSupabaseServerClient()
    .from("users")
    .select("phone")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.phone);
}

async function saveInitialRole(
  user: TelegramUser,
  role: "worker" | "employer",
) {
  const { data, error } = await createSupabaseServerClient()
    .from("users")
    .upsert(
      {
        telegram_id: user.id,
        full_name: fullName(user),
        telegram_username: user.username ?? null,
      },
      { onConflict: "telegram_id" },
    )
    .select("id")
    .single();
  if (error) throw error;
  await addUserRole(data.id, role);
  await setActiveUserRole(data.id, role);
}

async function updateGroupMember(
  telegramId: number,
  groupId: string,
  action: "accept" | "decline",
) {
  const supabase = createSupabaseServerClient();
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  if (userError) throw userError;
  if (!user) throw new Error("Foydalanuvchi topilmadi");

  const { data: membership, error: membershipError } = await supabase
    .from("group_application_members")
    .select("status")
    .eq("group_application_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership || membership.status !== "pending")
    throw new Error("Bu taklif endi faol emas");

  const nextStatus = action === "accept" ? "accepted" : "declined";
  const { error: updateError } = await supabase
    .from("group_application_members")
    .update({ status: nextStatus })
    .eq("group_application_id", groupId)
    .eq("user_id", user.id);
  if (updateError) throw updateError;

  if (action === "decline") {
    await supabase
      .from("group_applications")
      .update({ status: "cancelled" })
      .eq("id", groupId)
      .eq("status", "pending_members");
    return "Guruh arizasini rad etdingiz.";
  }

  const { count, error: pendingError } = await supabase
    .from("group_application_members")
    .select("user_id", { count: "exact", head: true })
    .eq("group_application_id", groupId)
    .eq("status", "pending");
  if (pendingError) throw pendingError;
  if ((count ?? 0) === 0) {
    await supabase
      .from("group_applications")
      .update({ status: "ready" })
      .eq("id", groupId)
      .eq("status", "pending_members");
  }
  return "Qatnashishingiz tasdiqlandi. Ish beruvchi guruhni tanlagach, sizga xabar boradi.";
}

export async function POST(request: NextRequest) {
  if (
    !isValidTelegramWebhookSecret(
      request.headers.get("x-telegram-bot-api-secret-token"),
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
    if (update.channel_post) {
      await handleChannelPost(update.channel_post);
      return NextResponse.json({ ok: true });
    }
    const callback = update.callback_query;
    if (callback?.data?.startsWith("moderation:")) {
      const [, jobId, action] = callback.data.split(":");
      if (
        !jobId ||
        (action !== "publish" && action !== "reject") ||
        !isTelegramAdmin(callback.from.id)
      ) {
        await answerTelegramCallbackQuery(
          callback.id,
          "Bu amal faqat admin uchun",
        );
        return NextResponse.json({ ok: true });
      }

      try {
        const job = await moderatePendingJob(jobId, action);
        const result =
          action === "publish"
            ? `“${job.title}” tasdiqlandi va ishchilarga ko‘rsatildi.`
            : `“${job.title}” rad etildi.`;
        await answerTelegramCallbackQuery(callback.id, result);
        if (callback.message) {
          await sendTelegramBotMessage(callback.message.chat.id, result);
        }
      } catch (moderationError) {
        await answerTelegramCallbackQuery(
          callback.id,
          moderationError instanceof Error
            ? moderationError.message
            : "Moderatsiya bajarilmadi",
        );
      }
      return NextResponse.json({ ok: true });
    }
    if (callback?.data?.startsWith("group:")) {
      const [, groupId, action] = callback.data.split(":");
      if (
        !groupId ||
        (action !== "accept" && action !== "decline") ||
        !callback.message
      ) {
        return NextResponse.json({ ok: true });
      }
      const message = await updateGroupMember(
        callback.from.id,
        groupId,
        action,
      );
      await answerTelegramCallbackQuery(callback.id);
      await sendTelegramBotMessage(callback.message.chat.id, message);
      return NextResponse.json({ ok: true });
    }
    if (callback?.data?.startsWith("role:") && callback.message) {
      const role = callback.data === "role:employer" ? "employer" : "worker";
      await saveInitialRole(callback.from, role);
      await answerTelegramCallbackQuery(callback.id);
      await sendTelegramBotMessage(
        callback.message.chat.id,
        "Zo‘r! Endi ro‘yxatdan o‘tishni yakunlash uchun telefon raqamingizni yuboring.",
        contactKeyboard,
      );
      return NextResponse.json({ ok: true });
    }
    const message = update.message;
    const user = message?.from;

    if (!message || !user) return NextResponse.json({ ok: true });

    if (message.text?.startsWith("/start")) {
      if (await isRegistered(user.id)) {
        await sendTelegramBotMessage(
          message.chat.id,
          `Xush kelibsiz, ${fullName(user)}! 👋\n\nJobTop’dagi ishlaringizni davom ettirishingiz mumkin.`,
          openAppKeyboard,
        );
        return NextResponse.json({ ok: true });
      }
      await sendTelegramBotMessage(
        message.chat.id,
        `Assalomu alaykum, ${fullName(user)}! 👋\n\nJobTop’da qaysi rol bilan boshlamoqchisiz? Keyin profilingizdan ikkinchi rolni ham qo‘sha olasiz.`,
        roleKeyboard,
      );
      return NextResponse.json({ ok: true });
    }

    if (message.contact) {
      if (message.contact.user_id !== user.id) {
        await sendTelegramBotMessage(
          message.chat.id,
          "Iltimos, pastdagi tugma orqali o‘z telefon raqamingizni yuboring.",
          contactKeyboard,
        );
        return NextResponse.json({ ok: true });
      }

      await registerContact(user, message.contact.phone_number);
      await sendTelegramBotMessage(
        message.chat.id,
        "Rahmat! Siz JobTop’da ro‘yxatdan o‘tdingiz. ✅",
        removeKeyboard,
      );
      await sendTelegramBotMessage(
        message.chat.id,
        "Endi platformaga kirib, ishlarni ko‘rishingiz yoki e’lon berishingiz mumkin.",
        openAppKeyboard,
      );
      return NextResponse.json({ ok: true });
    }

    await sendTelegramBotMessage(
      message.chat.id,
      "Ro‘yxatdan o‘tish uchun /start bosing va telefon raqamingizni yuboring.",
      contactKeyboard,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook handling failed", error);
    return NextResponse.json(
      { error: "Unable to handle update" },
      { status: 500 },
    );
  }
}
