import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { formatJobSchedule } from "@/shared/lib/format-job-schedule";
import type { Job, JobCategory } from "../model/types";

type JobRow = {
  id: string;
  category: JobCategory;
  title: string;
  district: string;
  starts_at: string;
  ends_at: string;
  pay_amount: number;
  openings: number;
  users: { full_name: string } | null;
};

type JobsCursor = { startsAt: string; id: string };

export type PublishedJobsPage = {
  jobs: Job[];
  nextCursor: string | null;
};

function decodeCursor(value: string | null): JobsCursor | null {
  if (!value) return null;
  try {
    const cursor = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as JobsCursor;
    return typeof cursor.startsAt === "string" && typeof cursor.id === "string"
      ? cursor
      : null;
  } catch {
    return null;
  }
}

function encodeCursor(job: JobRow) {
  return Buffer.from(
    JSON.stringify({ startsAt: job.starts_at, id: job.id }),
  ).toString("base64url");
}

function toJob(job: JobRow): Job {
  return {
    id: job.id,
    category: job.category,
    title: job.title,
    company: job.users?.full_name ?? "JobTop buyurtmachisi",
    district: job.district,
    schedule: formatJobSchedule(job.starts_at, job.ends_at),
    startsAt: job.starts_at,
    endsAt: job.ends_at,
    pay: job.pay_amount,
    openings: job.openings,
  };
}

export async function getPublishedJobsPage(
  cursorValue: string | null,
  limit = 10,
): Promise<PublishedJobsPage> {
  const supabase = createSupabaseServerClient();
  const cursor = decodeCursor(cursorValue);
  let query = supabase
    .from("jobs")
    .select(
      "id, category, title, district, starts_at, ends_at, pay_amount, openings, users!jobs_employer_id_fkey(full_name)",
    )
    .eq("status", "published")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(limit + 1);

  if (cursor) {
    query = query.or(
      `starts_at.gt.${cursor.startsAt},and(starts_at.eq.${cursor.startsAt},id.gt.${cursor.id})`,
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  const rows = (data ?? []) as unknown as JobRow[];
  const pageRows = rows.slice(0, limit);
  const lastJob = pageRows.at(-1);
  return {
    jobs: pageRows.map(toJob),
    nextCursor: rows.length > limit && lastJob ? encodeCursor(lastJob) : null,
  };
}
