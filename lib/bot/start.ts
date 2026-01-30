import TelegramBot from 'node-telegram-bot-api';
import { setBot } from './bot';
import { sendMessage } from './sendMessage';
import { selectArtist } from '@/lib/supabase/in_process_artists/selectArtist';
import { Address } from 'viem';
import { getPendingMedia } from './getPendingMedia';
import { handlePendingMedia } from './handlePendingMedia';
import { handleNewMedia } from './handleNewMedia';
import { logMessage } from './logMessage';

export async function runBot(): Promise<TelegramBot> {
  const bot = await setBot();

  bot.on('message', async msg => {
    const chatId = msg.chat.id;
    console.log(`📨 Received message from chat ${chatId}`);

    try {
      const sender = msg.chat.username;
      if (!sender) return;

      const artist = await selectArtist({
        telegram_username: sender,
      });

      if (!artist) {
        const welcomeMessage =
          'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your telegram account.';
        await logMessage(
          [
            { type: 'text', text: `From: @${sender}` },
            { type: 'text', text: msg.text || msg.caption || '' },
          ],
          'user'
        );
        await sendMessage(chatId, welcomeMessage);
        await logMessage([{ type: 'text', text: welcomeMessage }], 'assistant');
        return;
      }

      const pending = await getPendingMedia(msg, artist.address as Address);
      if (pending) {
        const handled = await handlePendingMedia({ pending, msg });
        if (handled) return;
      }

      await handleNewMedia({
        msg,
        artistAddress: artist.address as Address,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong.';
      await sendMessage(chatId, `❌ ${errorMessage}`);
    }
  });

  console.log('✅ Telegram bot started and listening for messages...');

  return bot;
}
