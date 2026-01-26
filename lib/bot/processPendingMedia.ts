import { Address } from 'viem';
import processPhoto from './processPhoto';
import processVideo from './processVideo';
import { sendMessage } from './sendMessage';
import { PendingMedia } from './pendingMediaState';
import { CreateMomentResult } from '@/lib/api/createMomentApi';

/**
 * Processes pending media with collected title.
 */
export async function processPendingMedia(
  pending: PendingMedia
): Promise<CreateMomentResult | undefined> {
  const { artistAddress, type, photo, video, title, chatId } = pending;

  // Use title or empty string
  const combinedText: string = title || '';

  let result: CreateMomentResult | undefined;

  if (type === 'photo' && photo) {
    result = await processPhoto(artistAddress, photo, combinedText);
  } else if (type === 'video' && video) {
    result = await processVideo(artistAddress, video, combinedText);
  } else {
    throw new Error(
      `❌ Invalid pending media state: type=${type}, photo=${!!photo}, video=${!!video}`
    );
  }

  if (result) {
    await sendMessage(
      chatId,
      `✅ Moment created! https://inprocess.world/sms/base:${result.contractAddress}/${result.tokenId}`
    );
  }

  return result;
}
