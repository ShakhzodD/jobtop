import { createHash } from "node:crypto";
import { parseJobDraft } from "@/features/create-job/model/validate-job-draft";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
import { getTelegramAdminIds } from "@/shared/lib/admin/is-telegram-admin";
import { sendTelegramBotMessage } from "@/shared/lib/telegram/bot-api";
import {
  parseExternalJobWithGemini,
  type ParsedExternalJob,
} from "./gemini-job-parser.server";
import type {
  ImportSource,
  RawJobListing,
} from "../model/parse-import-request";

type ImportResult = "queued" | "needs_details" | "duplicate";

function contentHash(source: ImportSource, listing: RawJobListing) {
  return createHash("sha256")
    .update(`${source.name}\n${listing.url ?? ""}\n${listing.text}`)
    .digest("hex");
}

function hasAllJobFields(job: ParsedExternalJob) {
  return Boolean(
    job.isVacancy &&
      job.category &&
      job.title &&
      job.description &&
      job.district &&
      job.address &&
      job.startsAt &&
      job.endsAt &&
      job.payAmount &&
      job.openings,
  );
}

async function notifyAdmins(job: {
  id: string;
  title: string;
  sourceName: string;
}) {
  const admins = getTelegramAdminIds();
  if (!admins.length) return;
  const text = [
    "🤖 AI manbadan e’lon topdi",
    "",
    `📌 ${job.title}`,
    `🔗 Manba: ${job.sourceName}`,
    "Tekshirib, tasdiqlang yoki rad eting.",
  ].join("\n");
  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "✅ Tasdiqlash",
          callback_data: `moderation:${job.id}:publish`,
        },
        { text: "✕ Rad etish", callback_data: `moderation:${job.id}:reject` },
      ],
    ],
  };
  await Promise.allSettled(
    admins.map((telegramId) =>
      sendTelegramBotMessage(telegramId, text, replyMarkup),
    ),
  );
}

export async function importExternalJob(
  source: ImportSource,
  listing: RawJobListing,
): Promise<ImportResult> {
  const supabase = createSupabaseServerClient();
  const hash = contentHash(source, listing);
  const { data: existing, error: existingError } = await supabase
    .from("ai_job_imports")
    .select("id")
    .eq("content_hash", hash)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return "duplicate";

  const parsed = await parseExternalJobWithGemini(source.name, listing.text);
  if (!hasAllJobFields(parsed)) {
    const { error } = await supabase.from("ai_job_imports").insert({
      source_name: source.name,
      source_url: source.url ?? null,
      source_external_id: listing.externalId ?? null,
      listing_url: listing.url ?? null,
      raw_text: listing.text,
      content_hash: hash,
      parsed_job: parsed,
      confidence: parsed.confidence,
      status: "needs_details",
    });
    if (error?.code === "23505") return "duplicate";
    if (error) throw error;
    return "needs_details";
  }

  const draft = parseJobDraft(parsed);
  const listingUrl = listing.url ?? source.url;
  if (!listingUrl) throw new Error("Tashqi e’lon uchun manba havolasi kerak");
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      employer_id: null,
      category: draft.category,
      title: draft.title,
      description: draft.description,
      district: draft.district,
      address: draft.address,
      starts_at: draft.startsAt,
      ends_at: draft.endsAt,
      pay_amount: draft.payAmount,
      openings: draft.openings,
      source_name: source.name,
      source_url: listingUrl,
      status: "pending_moderation",
    })
    .select("id")
    .single();
  if (jobError) throw jobError;

  const { error: importError } = await supabase.from("ai_job_imports").insert({
    source_name: source.name,
    source_url: source.url ?? null,
    source_external_id: listing.externalId ?? null,
    listing_url: listing.url ?? null,
    raw_text: listing.text,
    content_hash: hash,
    parsed_job: parsed,
    confidence: parsed.confidence,
    status: "queued_for_moderation",
    job_id: job.id,
  });
  if (importError) throw importError;
  await notifyAdmins({
    id: job.id,
    title: draft.title,
    sourceName: source.name,
  });
  return "queued";
}
