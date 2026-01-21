import { getBot } from './bot';

/**
 * Sends a message to a Telegram chat.
 * @param chatId - The Telegram chat ID to send the message to.
 * @param msg - The message text to send.
 * @throws Error if bot is unavailable or message sending fails.
 */
export async function sendMessage(chatId: number, msg: string) {
  const bot = getBot();
  if (!bot) {
    console.error('❌ Bot instance is not available');
    return false;
  }

  try {
    await bot.sendMessage(chatId, msg);
  } catch (error) {
    throw Error(
      '❌ Failed to send connect Telegram message to chatId ${chatId}:'
    );
  }
}
