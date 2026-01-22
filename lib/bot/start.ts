import TelegramBot from 'node-telegram-bot-api';
import { setBot } from './bot';
import { sendMessage } from './sendMessage';
import { selectArtist } from '@/lib/supabase/in_process_artists/selectArtist';
import processMedia from './processMedia';
import { Address } from 'viem';
import { getPendingMedia, PendingMediaType } from './pendingMediaState';
import { requestTitle } from './requestTitle';
import { processPendingMedia } from './processPendingMedia';

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

    // Check if media has caption/text, otherwise request title
    const photo = msg.photo;
    const video = msg.video;
    const text = msg?.text || '';
    const caption = msg?.caption || '';
    const hasCaptionOrText = !!(caption || text);

    // Check for pending state - if waiting for title input, process it
    const pending = getPendingMedia(chatId);
    if (pending?.waitingFor === 'title') {
      if (hasCaptionOrText) {
        await sendMessage(
          chatId,
          '⏳ In Process will post your moment. Please wait a few seconds...'
        );
        pending.title = caption || text;
        pending.waitingFor = null;
        await processPendingMedia(pending);
      }
      return;
    }

    if (photo || video) {
      if (hasCaptionOrText) {
        await sendMessage(
          chatId,
          '⏳ In Process will post your moment. Please wait a few seconds...'
        );
        await processMedia(artist.address as Address, msg);
        return;
      }
      await requestTitle(
        artist.address as Address,
        chatId,
        (photo ? 'photo' : 'video') as PendingMediaType,
        photo,
        video
      );
    } else
      await sendMessage(
        chatId,
        'Please send a photo or video with a caption or text.'
      );
  });

  console.log('✅ Telegram bot started and listening for messages...');

  return bot;
}
