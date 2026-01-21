import { getBot } from './bot';
import TelegramBot from 'node-telegram-bot-api';
import { Address } from 'viem';
import { PendingMedia, setPendingMedia } from './pendingMediaState';

/**
 * Handles media without caption by creating pending media state
 * and requesting title input from the user.
 */
export async function requestTitle(
  artistAddress: Address,
  chatId: number,
  type: 'photo' | 'video',
  photo?: TelegramBot.PhotoSize[],
  video?: TelegramBot.Video
): Promise<void> {
  const pendingMedia: PendingMedia = {
    artistAddress,
    chatId,
    type,
    photo,
    video,
    waitingFor: 'title',
  };
  setPendingMedia(pendingMedia);

  const bot = getBot();
  await bot.sendMessage(
    chatId,
    '📝 Please send the **title** for your moment:',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        force_reply: true,
        input_field_placeholder: 'Enter title...',
      },
    }
  );
}
