import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { moderatePendingJob } from "@/features/moderate-job/api/moderate-pending-job.server";
import { isTelegramAdmin } from "@/shared/lib/admin/is-telegram-admin";

type Context = { params: Promise<{ jobId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!isTelegramAdmin(user.telegramId)) {
      return NextResponse.json(
        { error: "Admin ruxsati kerak" },
        { status: 403 },
      );
    }

    const { jobId } = await context.params;
    return NextResponse.json({
      job: await moderatePendingJob(jobId, "publish"),
    });
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
