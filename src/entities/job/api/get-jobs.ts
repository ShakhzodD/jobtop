import type { Job } from "../model/types";

export type JobsPage = {
  jobs: Job[];
  nextCursor: string | null;
};

export async function getJobsPage(cursor: string | null): Promise<JobsPage> {
  const searchParams = new URLSearchParams({ limit: "10" });
  if (cursor) searchParams.set("cursor", cursor);
  const response = await fetch(`/api/jobs?${searchParams}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load jobs");
  return (await response.json()) as JobsPage;
}
