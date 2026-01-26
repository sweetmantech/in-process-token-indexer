import TelegramBot from 'node-telegram-bot-api';
import { Address } from 'viem';
import { PendingMedia, PendingMediaType } from './pendingMediaState';
import { getBot } from './bot';

const MEDIA_INFO_REGEX = /(?:\[)?MEDIA:(photo|video):([^\s\n\]]+)(?:\])?/;

/**
 * Checks if the incoming message is a reply to a title request and extracts pending media info.
 * Extracts media file IDs from the title request message text.
 * @param msg - The incoming Telegram message.
 * @param artistAddress - The artist's address.
 * @returns PendingMedia if we're waiting for title, undefined otherwise.
 */
export async function getPendingMedia(
  msg: TelegramBot.Message,
  artistAddress: Address
): Promise<PendingMedia | undefined> {
  // Check if this message is a reply
  if (!msg.reply_to_message) {
    return undefined;
  }

  const repliedMessage = msg.reply_to_message;

  // Debug: log what we're checking
  console.log('🔍 Checking reply message:', {
    hasText: !!repliedMessage.text,
    textPreview: repliedMessage.text?.substring(0, 100),
  });

  // Check if the replied message is our title request
  // The message might have markdown parsed, so check for key indicators
  const repliedText = repliedMessage.text || '';

  // Check if this looks like our title request message
  const isTitleRequest =
    repliedText.includes('📝') &&
    (repliedText.includes('title') || repliedText.includes('moment')) &&
    repliedText.includes('MEDIA:');

  if (!isTitleRequest) {
    return undefined;
  }

  // Extract media info from the title request message
  const mediaMatch = repliedText.match(MEDIA_INFO_REGEX);
  if (!mediaMatch) {
    console.log(
      '⚠️ Title request found but no media info embedded in:',
      repliedText
    );
    return undefined;
  }

  const [, type, fileId] = mediaMatch;
  const pendingType: PendingMediaType = type === 'photo' ? 'photo' : 'video';

  try {
    const bot = getBot();
    if (!bot) {
      console.error('❌ Bot instance is not available');
      return undefined;
    }

    // Get file info to reconstruct photo/video objects
    const file = await bot.getFile(fileId);
    if (!file) {
      console.log('⚠️ Could not get file info for fileId:', fileId);
      return undefined;
    }

    const chatId = msg.chat.id;

    // Reconstruct photo or video object from file ID
    // For photos, we need PhotoSize array, for videos we need Video object
    let photo: TelegramBot.PhotoSize[] | undefined;
    let video: TelegramBot.Video | undefined;

    if (pendingType === 'photo') {
      // Create a PhotoSize object with the file_id
      // processPhoto uses photos[photos.length - 1], so we just need one entry
      photo = [
        {
          file_id: fileId,
          file_unique_id: file.file_unique_id || '',
          width: 0, // Dimensions not critical for processing
          height: 0,
          file_size: file.file_size,
        },
      ];
    } else {
      // Create a minimal Video object with only required properties
      // processVideo only uses file_id and thumb.file_id
      video = {
        file_id: fileId,
        file_unique_id: file.file_unique_id || '',
        width: 0,
        height: 0,
        duration: 0,
        file_size: file.file_size,
      };
    }

    const pendingMedia: PendingMedia = {
      artistAddress,
      chatId,
      type: pendingType,
      photo,
      video,
      waitingFor: 'title',
    };

    return pendingMedia;
  } catch (error) {
    console.error('❌ Error getting pending media from Telegram:', error);
    return undefined;
  }
}
