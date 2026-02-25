import processPhoto from './processPhoto';
import processVideo from './processVideo';
import { sendMessage } from './sendMessage';
import { PendingMedia } from './pendingMediaState';
import { CreateMomentResult } from '@/lib/api/createMomentApi';
import isTooBigForTelegram, { TOO_BIG_MESSAGE } from './isTooBigForTelegram';

/**
 * Processes pending media with collected title.
 */
export async function processPendingMedia(
  pending: PendingMedia
): Promise<CreateMomentResult | undefined> {
  const { artistAddress, type, photo, video, title, chatId } = pending;

  // Use title or empty string
  const combinedText: string = title || '';

  if (isTooBigForTelegram(video, photo)) {
    await sendMessage(chatId, TOO_BIG_MESSAGE);
    return undefined;
  }

  let result: CreateMomentResult | undefined;

  try {
    if (type === 'photo' && photo) {
      result = await processPhoto(artistAddress, photo, combinedText);
    } else if (type === 'video' && video) {
      result = await processVideo(artistAddress, video, combinedText);
    } else {
      throw new Error(
        `❌ Invalid pending media state: type=${type}, photo=${!!photo}, video=${!!video}`
      );
    }
  } catch (error: any) {
    const isTooBig = error?.message?.includes('file is too big');
    const userMessage = isTooBig
      ? TOO_BIG_MESSAGE
      : '❌ Failed to process your media. Please try again.';
    await sendMessage(chatId, userMessage);
    return undefined;
  }

  if (result) {
    await sendMessage(
      chatId,
      `✅ Moment created! https://inprocess.world/sms/base:${result.contractAddress}/${result.tokenId}`
    );
  }

  return result;
}
