import type { EmployerApplication } from "@/entities/application/model/employer-application";
import type { EmployerJob } from "@/entities/job/model/types";
import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";

function telegramHeaders() {
  const initData = getTelegramInitData();
  if (!initData) throw new Error("Bu bo‘lim Telegram Mini App ichida ishlaydi");
  return { "x-telegram-init-data": initData };
}

export async function getEmployerJobs(): Promise<EmployerJob[]> {
  const response = await fetch("/api/employer/jobs", {
    cache: "no-store",
    headers: telegramHeaders(),
  });
  const body = (await response.json()) as {
    jobs?: EmployerJob[];
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "E’lonlarni yuklab bo‘lmadi");
  return body.jobs ?? [];
}

export async function getJobApplications(
  jobId: string,
): Promise<EmployerApplication[]> {
  const response = await fetch(`/api/jobs/${jobId}/applications`, {
    cache: "no-store",
    headers: telegramHeaders(),
  });
  const body = (await response.json()) as {
    applications?: Array<{
      id: string;
      status: EmployerApplication["status"];
      note: string | null;
      created_at: string;
      worker: EmployerApplication["worker"];
    }>;
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "Arizalarni yuklab bo‘lmadi");
  return (body.applications ?? []).map((application) => ({
    id: application.id,
    status: application.status,
    note: application.note,
    createdAt: application.created_at,
    worker: application.worker,
  }));
}
