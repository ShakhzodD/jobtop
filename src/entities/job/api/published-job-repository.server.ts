import { createSupabaseServerClient } from "@/shared/api/supabase/server";
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

function formatSchedule(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tashkent",
  });
  return `Bugun · ${formatter.format(new Date(start))}–${formatter.format(new Date(end))}`;
}

export async function getPublishedJobs(): Promise<Job[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, category, title, district, starts_at, ends_at, pay_amount, openings, users!jobs_employer_id_fkey(full_name)",
    )
    .eq("status", "published")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as unknown as JobRow[]).map((job) => ({
    id: job.id,
    category: job.category,
    title: job.title,
    company: job.users?.full_name ?? "JobTop buyurtmachisi",
    district: job.district,
    schedule: formatSchedule(job.starts_at, job.ends_at),
    pay: job.pay_amount,
    openings: job.openings,
  }));
}
