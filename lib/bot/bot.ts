import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_API_KEY } from '../consts';
import { sleep } from '../sleep';

/**
 * Global bot instance that can be accessed from anywhere in the codebase.
 * Set via setBot() and accessed via getBot().
 */
let bot: TelegramBot | null = null;

const STARTUP_DELAY_MS = 5000;
const CONFLICT_RETRY_DELAY_MS = 10000;

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

  // Wait for any previous Telegram polling session to fully release
  console.log(
    `⏳ Waiting ${STARTUP_DELAY_MS}ms before starting bot polling...`
  );
  await sleep(STARTUP_DELAY_MS);

  bot = new TelegramBot(TELEGRAM_BOT_API_KEY, { polling: true });

  // Handle polling errors — including 409 Conflict on deploy restart
  bot.on('polling_error', async error => {
    console.error('❌ Telegram polling error:', error.message);

    const is409 = error.message.includes('409');
    if (is409 && bot) {
      console.log(
        `⚠️ 409 Conflict detected. Restarting polling in ${CONFLICT_RETRY_DELAY_MS}ms...`
      );
      try {
        await bot.stopPolling();
        await sleep(CONFLICT_RETRY_DELAY_MS);
        await bot.startPolling();
        console.log('✅ Bot polling restarted after conflict.');
      } catch (restartError) {
        console.error(
          '❌ Failed to restart polling after conflict:',
          restartError
        );
      }
    }
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
