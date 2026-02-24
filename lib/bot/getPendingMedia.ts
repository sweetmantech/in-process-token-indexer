import TelegramBot from 'node-telegram-bot-api';
import { Address } from 'viem';
import { PendingMedia, PendingMediaType } from './pendingMediaState';
import { decodeMediaInfo } from './decodeMediaInfo';
import { getBot } from './bot';

const MEDIA_INFO_REGEX = /MEDIA:(photo|video):([^\s\n]+)/;

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
    (repliedText.includes('title') || repliedText.includes('moment'));

  if (!isTitleRequest) {
    return undefined;
  }

  // Extract and decode media info from zero-width character encoding
  // Search for zero-width characters (U+200B, U+200C, U+200D)
  // Use global match to find all sequences, then try to decode each one
  const ZERO_WIDTH_CHARS = /[\u200B\u200C\u200D]+/g;
  const zeroWidthMatches = repliedText.match(ZERO_WIDTH_CHARS);

  if (!zeroWidthMatches || zeroWidthMatches.length === 0) {
    console.log(
      '⚠️ Title request found but no encoded media info embedded in message'
    );
    return undefined;
  }

  // Try to decode each zero-width sequence to find the valid MEDIA: pattern
  let decodedMediaInfo: string | null = null;
  for (const zeroWidthSeq of zeroWidthMatches) {
    const decoded = decodeMediaInfo(zeroWidthSeq);
    if (decoded && decoded.match(MEDIA_INFO_REGEX)) {
      decodedMediaInfo = decoded;
      break;
    }
  }

  if (!decodedMediaInfo) {
    console.log(
      '⚠️ Failed to decode valid media info from zero-width characters'
    );
    return undefined;
  }

  // Extract media info from decoded text
  const mediaMatch = decodedMediaInfo.match(MEDIA_INFO_REGEX);
  if (!mediaMatch) {
    console.log(
      '⚠️ Decoded text does not match MEDIA: pattern:',
      decodedMediaInfo
    );
    return undefined;
  }

  const [, type, fileId] = mediaMatch;
  const pendingType: PendingMediaType = type === 'photo' ? 'photo' : 'video';

  try {
    const bot = getBot();
    if (!bot) return undefined;

    const fileInfo = await bot.getFile(fileId);
    if (!fileInfo) return undefined;

    const chatId = msg.chat.id;

    let photo: TelegramBot.PhotoSize[] | undefined;
    let video: TelegramBot.Video | undefined;

    if (pendingType === 'photo') {
      photo = [
        {
          file_id: fileInfo.file_id,
          file_unique_id: fileInfo.file_unique_id,
          file_size: fileInfo.file_size,
          width: 0,
          height: 0,
        },
      ];
    } else {
      video = {
        file_id: fileInfo.file_id,
        file_unique_id: fileInfo.file_unique_id,
        file_size: fileInfo.file_size,
        width: 0,
        height: 0,
        duration: 0,
      };
    }

    const pendingMedia: PendingMedia = {
      artistAddress,
      chatId,
      type: pendingType,
      photo,
      video,
      title: msg.text || undefined,
      waitingFor: msg.text ? null : 'title',
    };

    return pendingMedia;
  } catch (error) {
    console.error('❌ Error getting pending media from Telegram:', error);
    return undefined;
  }
}
