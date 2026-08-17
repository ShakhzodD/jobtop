export function isTelegramAdmin(telegramId: number) {
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS ?? "")
    .split(",")
    .map((id) => Number(id.trim()))
    .filter(Number.isSafeInteger);

  return adminIds.includes(telegramId);
}
