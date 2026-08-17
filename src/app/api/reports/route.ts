import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const { userId, jobId, reason } = await request.json();
    if (
      typeof userId !== "string" ||
      typeof reason !== "string" ||
      reason.trim().length < 3
    )
      throw new Error("Shikoyat ma’lumoti noto‘g‘ri");
    const { error } = await createSupabaseServerClient()
      .from("reports")
      .insert({
        reporter_id: user.id,
        reported_id: userId,
        job_id: typeof jobId === "string" ? jobId : null,
        reason: reason.trim(),
      });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Shikoyat yuborilmadi",
      },
      { status: 400 },
    );
  }
}
