import type { JobCategory } from "@/entities/job/model/types";
import { getTelegramInitData } from "@/shared/lib/telegram/initialize-web-app";

export type ParsedJobText = {
  category: JobCategory | null;
  title: string | null;
  description: string | null;
  district: string | null;
  address: string | null;
  startsAt: string | null;
  endsAt: string | null;
  payAmount: number | null;
  openings: number | null;
};

export async function parseJobText(text: string): Promise<ParsedJobText> {
  const initData = getTelegramInitData();
  if (!initData)
    throw new Error("E’lon berish Telegram Mini App ichida ishlaydi");

  const response = await fetch("/api/jobs/parse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-telegram-init-data": initData,
    },
    body: JSON.stringify({ text }),
  });
  const body = (await response.json()) as {
    job?: ParsedJobText;
    error?: string;
  };
  if (!response.ok)
    throw new Error(body.error ?? "Matnni tahlil qilib bo‘lmadi");
  return body.job!;
}
