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
  } catch (error) {
    console.error("Unable to load published jobs", error);
    const message = error instanceof Error ? error.message : "";
    const code =
      message === "Missing NEXT_PUBLIC_SUPABASE_URL"
        ? "MISSING_SUPABASE_URL"
        : message === "Missing SUPABASE_SECRET_KEY"
          ? "MISSING_SUPABASE_SECRET_KEY"
          :
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : error instanceof Error
          ? error.name
          : "UNKNOWN";
    return NextResponse.json({ error: "Jobs are temporarily unavailable", code }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const [user, draft] = await Promise.all([getCurrentUserFromRequest(request), request.json().then(parseJobDraft)]);
    const { data, error } = await createSupabaseServerClient()
      .from("jobs")
      .insert({ employer_id: user.id, category: draft.category, title: draft.title, description: draft.description, district: draft.district, address: draft.address, starts_at: draft.startsAt, ends_at: draft.endsAt, pay_amount: draft.payAmount, openings: draft.openings, status: "pending_moderation" })
      .select("id, status")
      .single();
    if (error) throw error;
    return NextResponse.json({ job: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create job";
    return NextResponse.json({ error: message }, { status: message.includes("Telegram") ? 401 : 400 });
  }
}
