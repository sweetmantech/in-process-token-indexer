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
  processMessageMoment({
    collectionAddress: result.contractAddress.toLowerCase(),
    tokenId: result.tokenId.toString(),
    artistAddress,
  });
  return result;
};

export default processPhoto;
