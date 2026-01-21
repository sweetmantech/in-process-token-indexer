import { getBot } from './bot';
import { selectArtist } from '../supabase/in_process_artists/selectArtist';

/**
 * Checks if an artist is registered and sends a connect Telegram message if not found.
 * @param chatId - The Telegram chat ID to send messages to.
 * @param telegramUsername - The Telegram username to check.
 * @returns True if artist exists, false otherwise.
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
    if (bot) {
      bot.sendMessage(
        chatId,
        'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your telegram account.'
      );
    }
    return true;
  }

  return false;
}
