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
      worker: {
        id: string;
        full_name: string;
        telegram_username: string | null;
        district: string | null;
        birth_date: string | null;
        experience_years: number | null;
        about: string | null;
      } | null;
    }>;
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "Arizalarni yuklab bo‘lmadi");
  return (body.applications ?? []).map((application) => ({
    id: application.id,
    status: application.status,
    note: application.note,
    createdAt: application.created_at,
    worker: application.worker
      ? {
          id: application.worker.id,
          fullName: application.worker.full_name,
          telegramUsername: application.worker.telegram_username,
          district: application.worker.district,
          birthDate: application.worker.birth_date,
          experienceYears: application.worker.experience_years,
          about: application.worker.about,
        }
      : null,
  }));
}
