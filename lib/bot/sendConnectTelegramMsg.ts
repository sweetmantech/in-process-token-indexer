import { getBot } from './bot';
import { selectArtist } from '@/lib/supabase/in_process_artists/selectArtist';

/**
 * Checks if an artist is registered and sends a connect Telegram message if not found.
 * @param chatId - The Telegram chat ID to send messages to.
 * @param telegramUsername - The Telegram username to check.
 * @returns True if artist is NOT found and a connect Telegram message was sent successfully, false if artist exists, bot is unavailable, or message sending fails.
 */
export async function sendConnectTelegramMsg(
  chatId: number,
  telegramUsername: string
): Promise<boolean> {
  const artist = await selectArtist({
    telegram_username: telegramUsername,
  });

  if (!artist) {
    const bot = getBot();
    if (!bot) {
      console.error('❌ Bot instance is not available');
      return false;
    }

    try {
      await bot.sendMessage(
        chatId,
        'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your telegram account.'
      );
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to send connect Telegram message to chatId ${chatId}:`,
        error
      );
      return false;
    }
  }

  return false;
}
