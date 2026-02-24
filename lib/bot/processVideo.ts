import { Address } from 'viem';
import TelegramBot from 'node-telegram-bot-api';
import uploadMetadata from './uploadMetadata';
import getCreateParameter from '../getCreateParameter';
import { createMomentApi } from '../api/createMomentApi';
import { logMessage } from './logMessage';
import processMessageMoment from './processMessageMoment';
import { tasks } from '@trigger.dev/sdk';
import { base } from 'viem/chains';

const processVideo = async (
  artistAddress: Address,
  video: TelegramBot.Video,
  text: string
) => {
  if (!video) return;

  const { uri, name, mimeType, animationUri } = await uploadMetadata({
    photoId: video.thumb?.file_id,
    videoId: video.file_id,
    text,
  });

  const parameters = await getCreateParameter(artistAddress, name, uri);

  await logMessage(
    [
      { type: 'text', text },
      { type: 'file', url: animationUri, mediaType: mimeType },
    ],
    'user',
    artistAddress
  );
  const result = await createMomentApi(parameters);

  processMessageMoment({
    collectionAddress: result.contractAddress.toLowerCase(),
    tokenId: result.tokenId.toString(),
    artistAddress,
  });

  await tasks.trigger('migrate-mux-to-arweave', {
    collectionAddress: result.contractAddress.toLowerCase(),
    tokenId: result.tokenId.toString(),
    artistAddress,
    chainId: base.id,
  });

  return result;
};

export default processVideo;
