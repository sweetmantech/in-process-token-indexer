import TelegramBot from 'node-telegram-bot-api';
import uploadMetadata from './uploadMetadata';
import { Address } from 'viem';
import { createMomentApi } from '../api/createMomentApi';
import getCreateParameter from '../getCreateParameter';
import { logMessage } from './logMessage';
import processMessageMoment from './processMessageMoment';

const processPhoto = async (
  artistAddress: Address,
  photos: TelegramBot.PhotoSize[],
  text: string
) => {
  if (!photos || photos.length === 0) return;

  const { uri, name, mimeType, imageUri } = await uploadMetadata({
    photoId: photos[photos.length - 1].file_id,
    text,
  });
  const parameters = await getCreateParameter(artistAddress, name, uri);
  await logMessage(
    [
      { type: 'text', text },
      { type: 'file', url: imageUri, mediaType: mimeType },
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
      collectionAddress: result.contractAddress.toLowerCase(),
      tokenId: result.tokenId.toString(),
    });
  return result;
};

export default processPhoto;
