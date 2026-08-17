import { createHmac, timingSafeEqual } from "node:crypto";

type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

export type VerifiedTelegramUser = {
  telegramId: number;
  fullName: string;
  username: string | null;
  photoUrl: string | null;
};

export function verifyTelegramInitData(initData: string): VerifiedTelegramUser {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("Telegram bot is not configured");

  const parameters = new URLSearchParams(initData);
  const suppliedHash = parameters.get("hash");
  const authDate = Number(parameters.get("auth_date"));
  const userJson = parameters.get("user");
  if (!suppliedHash || !authDate || !userJson) throw new Error("Invalid Telegram session");
  if (Math.floor(Date.now() / 1000) - authDate > 86_400) throw new Error("Telegram session expired");

  parameters.delete("hash");
  const dataCheckString = [...parameters.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expectedHash = createHmac("sha256", secret).update(dataCheckString).digest("hex");
  const providedHash = Buffer.from(suppliedHash, "hex");
  const calculatedHash = Buffer.from(expectedHash, "hex");
  if (providedHash.length !== calculatedHash.length || !timingSafeEqual(providedHash, calculatedHash)) throw new Error("Invalid Telegram signature");

  const telegramUser = JSON.parse(userJson) as TelegramWebAppUser;
  if (!Number.isSafeInteger(telegramUser.id)) throw new Error("Invalid Telegram user");
  const fullName = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ").trim() || telegramUser.username || "JobTop foydalanuvchisi";

  return { telegramId: telegramUser.id, fullName, username: telegramUser.username ?? null, photoUrl: telegramUser.photo_url ?? null };
}
