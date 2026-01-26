import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_API_KEY } from '../consts';

/**
 * Global bot instance that can be accessed from anywhere in the codebase.
 * Set via setBot() and accessed via getBot().
 */
let bot: TelegramBot | null = null;

/**
 * Creates and sets the global bot instance.
 * Stops any existing bot instance before creating a new one to avoid duplicate polling connections.
 * @returns The Telegram bot instance.
 */
export async function setBot(): Promise<TelegramBot> {
  // Stop existing bot instance if it exists
  if (bot) {
    console.log(
      '🛑 Stopping existing bot instance before re-initialization...'
    );
    try {
      await bot.stopPolling();
    } catch (error) {
      console.log('⚠️ Error stopping existing bot polling:', error);
    }
    bot = null;
  }

  // Validate API key before creating bot
  if (!TELEGRAM_BOT_API_KEY) {
    console.error(
      '❌ TELEGRAM_BOT_API_KEY is not set in environment variables'
    );
    process.exit(1);
  }

  bot = new TelegramBot(TELEGRAM_BOT_API_KEY, { polling: true });

  // Handle polling errors to prevent crashes
  bot.on('polling_error', error => {
    console.error('❌ Telegram polling error:', error.message);
    // Don't exit on polling errors - they might be temporary
    // The bot will automatically retry
  });

  return bot;
}

/**
 * Gets the global bot instance.
 * @returns The Telegram bot instance, or null if not initialized.
 */
export function getBot(): TelegramBot | null {
  return bot;
}
