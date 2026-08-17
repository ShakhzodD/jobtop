import { NextResponse } from "next/server";
import { getPublishedJobs } from "@/entities/job/api/published-job-repository.server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { parseJobDraft } from "@/features/create-job/model/validate-job-draft";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ jobs: await getPublishedJobs() });
  } catch {
    return NextResponse.json(
      { error: "Jobs are temporarily unavailable" },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const [user, draft] = await Promise.all([
      getCurrentUserFromRequest(request),
      request.json().then(parseJobDraft),
    ]);
    if (user.activeRole !== "employer")
      throw new Error("E’lon berish uchun ish beruvchi rolini tanlang");
    const { data, error } = await createSupabaseServerClient()
      .from("jobs")
      .insert({
        employer_id: user.id,
        category: draft.category,
        title: draft.title,
        description: draft.description,
        district: draft.district,
        address: draft.address,
        starts_at: draft.startsAt,
        ends_at: draft.endsAt,
        pay_amount: draft.payAmount,
        openings: draft.openings,
        status: "pending_moderation",
      })
      .select("id, status")
      .single();
    if (error) throw error;
    return NextResponse.json({ job: data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create job";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Telegram") ? 401 : 400 },
    );
  }
}
