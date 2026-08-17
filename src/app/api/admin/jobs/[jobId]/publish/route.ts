import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { isTelegramAdmin } from "@/shared/lib/admin/is-telegram-admin";

type Context = { params: Promise<{ jobId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!isTelegramAdmin(user.telegramId))
      return NextResponse.json(
        { error: "Admin ruxsati kerak" },
        { status: 403 },
      );
    const { jobId } = await context.params;
    const { data, error } = await createSupabaseServerClient()
      .from("jobs")
      .update({ status: "published" })
      .eq("id", jobId)
      .eq("status", "pending_moderation")
      .select("id, status")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return NextResponse.json(
        { error: "Tasdiqlanadigan e’lon topilmadi" },
        { status: 404 },
      );
    return NextResponse.json({ job: data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "E’lonni tasdiqlab bo‘lmadi",
      },
      { status: 400 },
    );
  }
}
