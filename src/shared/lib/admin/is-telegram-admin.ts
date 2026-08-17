export function getTelegramAdminIds() {
  return (process.env.ADMIN_TELEGRAM_IDS ?? "")
    .split(",")
    .map((id) => Number(id.trim()))
    .filter(Number.isSafeInteger);
}

export function isTelegramAdmin(telegramId: number) {
  return getTelegramAdminIds().includes(telegramId);
}
