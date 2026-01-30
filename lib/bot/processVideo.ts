import { Address } from 'viem';
import TelegramBot from 'node-telegram-bot-api';
import uploadMetadata from './uploadMetadata';
import getCreateParameter from '../getCreateParameter';
import { createMomentApi } from '../api/createMomentApi';
import { logMessage } from './logMessage';
import processMessageMoment from './processMessageMoment';

const processVideo = async (
  artistAddress: Address,
  video: TelegramBot.Video,
  text: string
) => {
  if (!video) return;
  const { uri, name, mimeType } = await uploadMetadata({
    photoId: video.thumb?.file_id,
    videoId: video.file_id,
    text,
  });
  const parameters = await getCreateParameter(artistAddress, name, uri);
  await logMessage(
    [
      { type: 'text', text },
      { type: 'video', url: uri, mimeType },
    ],
    'user',
    artistAddress
  );
  const result = await createMomentApi(parameters);
  const momentMessageId = await logMessage(
    [
      {
        type: 'text',
        text: `✅ Moment created! https://inprocess.world/sms/base:${result.contractAddress}/${result.tokenId}`,
      },
    ],
    'assistant',
    artistAddress
  );
  if (momentMessageId)
    processMessageMoment({
      messageId: momentMessageId,
      collectionAddress: result.contractAddress,
      tokenId: result.tokenId.toString(),
    });
  return result;
};

export default processVideo;
