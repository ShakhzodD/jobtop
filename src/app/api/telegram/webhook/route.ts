import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import {
  answerTelegramCallbackQuery,
  isValidTelegramWebhookSecret,
  sendTelegramBotMessage,
} from "@/shared/lib/telegram/bot-api";
import {
  addUserRole,
  setActiveUserRole,
} from "@/entities/user/api/user-role-repository.server";

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

type TelegramMessage = {
  chat: { id: number };
  from?: TelegramUser;
  text?: string;
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

function fullName(user: TelegramUser) {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    "JobTop foydalanuvchisi"
  );
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
    const callback = update.callback_query;
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
        "Rahmat! Siz JobTop’da ro‘yxatdan o‘tdingiz. ✅\n\nEndi Open App tugmasi orqali ishlarni ko‘rishingiz yoki e’lon berishingiz mumkin.",
        removeKeyboard,
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
