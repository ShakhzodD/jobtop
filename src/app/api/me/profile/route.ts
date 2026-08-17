import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { isTelegramAdmin } from "@/shared/lib/admin/is-telegram-admin";

function optionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  return value.trim().slice(0, maxLength) || null;
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const body = (await request.json()) as Record<string, unknown>;
    const birthDate = optionalText(body.birthDate, 10);
    const experienceYears =
      body.experienceYears === "" || body.experienceYears == null
        ? null
        : Number(body.experienceYears);

    if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      throw new Error("Tug‘ilgan sana noto‘g‘ri");
    }
    if (
      experienceYears !== null &&
      (!Number.isInteger(experienceYears) ||
        experienceYears < 0 ||
        experienceYears > 60)
    ) {
      throw new Error("Tajriba 0 dan 60 yilgacha bo‘lishi kerak");
    }

    const { error } = await createSupabaseServerClient()
      .from("users")
      .update({
        birth_date: birthDate,
        district: optionalText(body.district, 80),
        experience_years: experienceYears,
        about: optionalText(body.about, 500),
      })
      .eq("id", user.id);
    if (error) throw error;

    const updatedUser = await getCurrentUserFromRequest(request);
    return NextResponse.json({
      user: {
        ...updatedUser,
        isAdmin: isTelegramAdmin(updatedUser.telegramId),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Profilni saqlab bo‘lmadi";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Telegram") ? 401 : 400 },
    );
  }
}
