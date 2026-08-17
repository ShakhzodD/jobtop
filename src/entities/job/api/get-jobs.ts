import type { Job } from "../model/types";

export async function getJobsFromApi(): Promise<Job[]> {
  const response = await fetch("/api/jobs", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load jobs");
  const body = await response.json() as { jobs: Job[] };
  return body.jobs;
}
