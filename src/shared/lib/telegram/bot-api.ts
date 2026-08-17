type TelegramReplyMarkup = Record<string, unknown>;

function getBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Telegram bot token is not configured");
  return token;
}

export function isValidTelegramWebhookSecret(value: string | null) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  return Boolean(secret && value && secret === value);
}

export async function sendTelegramBotMessage(
  chatId: number,
  text: string,
  replyMarkup?: TelegramReplyMarkup,
) {
  const response = await fetch(
    `https://api.telegram.org/bot${getBotToken()}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup: replyMarkup,
      }),
    },
  );

  if (!response.ok) throw new Error("Unable to send Telegram bot message");
}

export async function answerTelegramCallbackQuery(
  callbackQueryId: string,
  text?: string,
) {
  const response = await fetch(
    `https://api.telegram.org/bot${getBotToken()}/answerCallbackQuery`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        ...(text ? { text, show_alert: true } : {}),
      }),
    },
  );
  if (!response.ok) throw new Error("Unable to answer Telegram callback query");
}
