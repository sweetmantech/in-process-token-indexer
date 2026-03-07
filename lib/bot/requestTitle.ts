import { getBot } from './bot';
import TelegramBot from 'node-telegram-bot-api';
import { encodeMediaInfo } from './encodeMediaInfo';

/**
 * Handles media without caption by requesting title input from the user.
 * Embeds media file IDs in the message for later retrieval.
 */
export async function requestTitle(
  chatId: number,
  mediaMessageId: number,
  photo?: TelegramBot.PhotoSize[],
  video?: TelegramBot.Video
): Promise<void> {
  try {
    const bot = getBot();
    if (!bot) {
      throw new Error('❌ Bot instance is not available');
    }

    // Extract file IDs from media
    let mediaData: {
      type: 'photo' | 'video';
      fileId: string;
    } | null = null;

    if (photo && photo.length > 0) {
      // Get the largest photo
      const largestPhoto = photo[photo.length - 1];
      mediaData = { type: 'photo', fileId: largestPhoto.file_id };
    } else if (video) {
      const thumbFileId = video.thumb?.file_id || '';
      mediaData = {
        type: 'video',
        fileId: `${video.file_id}:${thumbFileId}`,
      };
    }

    if (!mediaData) {
      throw new Error('❌ No media file ID found');
    }

    // Embed media info in message using zero-width character encoding (truly hidden from user)
    // Format: MEDIA:type:fileId encoded with zero-width characters
    const mediaInfo = `MEDIA:${mediaData.type}:${mediaData.fileId}`;
    const encodedMediaInfo = encodeMediaInfo(mediaInfo);
    const messageText = `📝 Please send the **title** for your moment:\n${encodedMediaInfo}`;

    await bot.sendMessage(chatId, messageText, {
      parse_mode: 'Markdown',
      reply_to_message_id: mediaMessageId,
      reply_markup: {
        force_reply: true,
        input_field_placeholder: 'Enter title...',
      },
    });
  } catch (error) {
    console.error('❌ Failed to send title request message:', error);
    throw error;
  }
}
