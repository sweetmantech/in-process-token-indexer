import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_API_KEY } from '../consts';

let bot: TelegramBot | null = null;

export async function setBot(): Promise<TelegramBot> {
  if (bot) {
    try {
      await bot.stopPolling();
    } catch {}
    bot = null;
  }

  if (!TELEGRAM_BOT_API_KEY) {
    console.error(
      '❌ TELEGRAM_BOT_API_KEY is not set in environment variables'
    );
    process.exit(1);
  }

  bot = new TelegramBot(TELEGRAM_BOT_API_KEY, { polling: true });

  bot.on('polling_error', error => {
    console.error('❌ Telegram polling error:', error.message);
  });

  return bot;
}

export function getBot(): TelegramBot | null {
  return bot;
}
