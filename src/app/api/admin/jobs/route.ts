import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import type { ModerationJob } from "@/entities/job/model/types";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { isTelegramAdmin } from "@/shared/lib/admin/is-telegram-admin";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!isTelegramAdmin(user.telegramId)) {
      return NextResponse.json(
        { error: "Admin ruxsati kerak" },
        { status: 403 },
      );
    }

    const { data, error } = await createSupabaseServerClient()
      .from("jobs")
      .select(
        "id, category, title, description, district, address, starts_at, ends_at, pay_amount, openings, created_at, source_name, source_url",
      )
      .eq("status", "pending_moderation")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const jobs: ModerationJob[] = (data ?? []).map((job) => ({
      id: job.id,
      category: job.category as ModerationJob["category"],
      title: job.title,
      description: job.description,
      district: job.district,
      address: job.address,
      startsAt: job.starts_at,
      endsAt: job.ends_at,
      payAmount: job.pay_amount,
      openings: job.openings,
      createdAt: job.created_at,
      sourceName: job.source_name ?? undefined,
      sourceUrl: job.source_url ?? undefined,
    }));

    return NextResponse.json({ jobs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "E’lonlarni yuklab bo‘lmadi";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Telegram") ? 401 : 400 },
    );
  }
}
