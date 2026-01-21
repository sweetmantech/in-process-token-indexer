import TelegramBot from 'node-telegram-bot-api';
import { setBot } from './bot';
import { sendMessage } from './sendMessage';
import { selectArtist } from '@/lib/supabase/in_process_artists/selectArtist';
import processPhoto from './processPhoto';
import { Address } from 'viem';

export function runBot(): TelegramBot {
  const bot = setBot();

  bot.on('message', async msg => {
    const chatId = msg.chat.id;
    console.log(`📨 Received message from chat ${chatId}`);
    const sender = msg.chat.username;
    if (!sender) return;

    const artist = await selectArtist({
      telegram_username: sender,
    });

    if (!artist) {
      await sendMessage(
        chatId,
        'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your telegram account.'
      );

      return;
    }

    const photo = msg.photo;
    const text = msg?.text || '';
    const caption = msg?.caption || '';
    if (photo) {
      const result = await processPhoto(
        artist.address as Address,
        photo,
        caption || text
      );
      if (result) {
        await sendMessage(
          chatId,
          `Moment created! https://inprocess.world/sms/base:${result.contractAddress}/${result.tokenId}`
        );
      }
    }
  });

  console.log('✅ Telegram bot started and listening for messages...');

  return bot;
}
