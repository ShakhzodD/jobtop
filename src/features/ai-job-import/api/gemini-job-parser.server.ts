import { jobCategories, type JobCategory } from "@/entities/job/model/types";

export type ParsedExternalJob = {
  isVacancy: boolean;
  category: JobCategory | null;
  title: string | null;
  description: string | null;
  district: string | null;
  address: string | null;
  startsAt: string | null;
  endsAt: string | null;
  payAmount: number | null;
  openings: number | null;
  confidence: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

function requiredGeminiSetting(name: "GEMINI_API_KEY" | "GEMINI_MODEL") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} sozlanmagan`);
  return value;
}

function nullableText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const text = value.trim().slice(0, maxLength);
  return text || null;
}

function nullableIsoDate(value: unknown) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return null;
  return new Date(value).toISOString();
}

function nullablePositiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function parseGeminiResult(value: unknown): ParsedExternalJob {
  const data =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const category = jobCategories.includes(data.category as JobCategory)
    ? (data.category as JobCategory)
    : null;
  const startsAt = nullableIsoDate(data.startsAt);
  const endsAt = nullableIsoDate(data.endsAt);
  const confidence = Number(data.confidence);

  return {
    isVacancy: data.isVacancy === true,
    category,
    title: nullableText(data.title, 140),
    description: nullableText(data.description, 2_000),
    district: nullableText(data.district, 100),
    address: nullableText(data.address, 300),
    startsAt,
    endsAt:
      startsAt && endsAt && Date.parse(endsAt) > Date.parse(startsAt)
        ? endsAt
        : null,
    payAmount: nullablePositiveInteger(data.payAmount),
    openings: nullablePositiveInteger(data.openings),
    confidence: Number.isFinite(confidence)
      ? Math.min(Math.max(confidence, 0), 1)
      : 0,
  };
}

export async function parseExternalJobWithGemini(
  sourceName: string,
  rawText: string,
): Promise<ParsedExternalJob> {
  const apiKey = requiredGeminiSetting("GEMINI_API_KEY");
  const model = requiredGeminiSetting("GEMINI_MODEL");
  const prompt = `Sen JobTop uchun e’lon tahlilchisisan. Quyidagi matnni faqat JSON obyektga aylantir. Hech qanday Markdown yoki izoh yozma.

Bugungi vaqt: ${new Date().toISOString()}. Vaqt zonasi: Asia/Tashkent (+05:00).
Ruxsat etilgan category: ${jobCategories.join(", ")}.
Faqat ish/vakansiya bo‘lsa isVacancy=true qil. Ma’lumot matnda bo‘lmasa null qaytar; hech narsani o‘ylab topma. Sana-vaqt ISO 8601 formatida bo‘lsin. payAmount son bilan, so‘mda; openings butun son bo‘lsin.

JSON sxema:
{"isVacancy":true,"category":"Kuryer"|"Xizmat"|"Yuk tashish"|"Tozalash"|null,"title":string|null,"description":string|null,"district":string|null,"address":string|null,"startsAt":string|null,"endsAt":string|null,"payAmount":number|null,"openings":number|null,"confidence":number}

Manba: ${sourceName}
E’lon matni:
${rawText}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0,
        },
      }),
    },
  );
  if (!response.ok) throw new Error("Gemini e’lonni tahlil qila olmadi");
  const result = (await response.json()) as GeminiResponse;
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini bo‘sh javob qaytardi");

  try {
    return parseGeminiResult(JSON.parse(text));
  } catch {
    throw new Error("Gemini noto‘g‘ri formatda javob qaytardi");
  }
}
