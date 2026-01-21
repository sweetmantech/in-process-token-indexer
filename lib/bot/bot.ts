import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_API_KEY } from '../consts';

/**
 * Global bot instance that can be accessed from anywhere in the codebase.
 * Set via setBot() and accessed via getBot().
 */
let bot: TelegramBot | null = null;

/**
 * Creates and sets the global bot instance.
 * @returns The Telegram bot instance.
 */
export function setBot(): TelegramBot {
  if (!TELEGRAM_BOT_API_KEY) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in environment variables');
    process.exit(1);
  }

  bot = new TelegramBot(TELEGRAM_BOT_API_KEY, { polling: true });

  return bot;
}

/**
 * Gets the global bot instance.
 * @returns The Telegram bot instance, or null if not initialized.
 */
export function getBot(): TelegramBot | null {
  return bot;
}
