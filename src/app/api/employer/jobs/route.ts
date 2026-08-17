import { NextRequest, NextResponse } from "next/server";
import type { EmployerJob } from "@/entities/job/model/types";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user.roles.includes("employer")) {
      return NextResponse.json(
        { error: "Ish beruvchi roli kerak" },
        { status: 403 },
      );
    }

    const supabase = createSupabaseServerClient();
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select(
        "id, title, category, district, starts_at, pay_amount, openings, status",
      )
      .eq("employer_id", user.id)
      .in("status", ["pending_moderation", "published", "filled", "cancelled"])
      .order("starts_at", { ascending: false });
    if (jobsError) throw jobsError;

    const jobIds = (jobs ?? []).map(({ id }) => id);
    const { data: applications, error: applicationsError } = jobIds.length
      ? await supabase
          .from("applications")
          .select("job_id, status")
          .in("job_id", jobIds)
      : { data: [], error: null };
    if (applicationsError) throw applicationsError;

    const jobsWithCounts: EmployerJob[] = (jobs ?? []).map((job) => {
      const jobApplications = (applications ?? []).filter(
        ({ job_id }) => job_id === job.id,
      );
      return {
        id: job.id,
        title: job.title,
        category: job.category as EmployerJob["category"],
        district: job.district,
        startsAt: job.starts_at,
        payAmount: job.pay_amount,
        openings: job.openings,
        status: job.status as EmployerJob["status"],
        applicationCount: jobApplications.length,
        selectedCount: jobApplications.filter(
          ({ status }) => status === "selected",
        ).length,
      };
    });

    return NextResponse.json({ jobs: jobsWithCounts });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "E’lonlarni yuklab bo‘lmadi";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Telegram") ? 401 : 400 },
    );
  }
}
