import { uploadJson } from '../uploadJson';
import { getBlob } from './getBlob';
import uploadToArweave from '../uploadToArweave';
import TelegramBot from 'node-telegram-bot-api';

const uploadMetadata = async (photo: TelegramBot.PhotoSize, text: string) => {
  const { blob, mimeType } = await getBlob(photo.file_id);
  const name = text || `photo-${Date.now()}`;
  const buffer = Buffer.from(await blob.arrayBuffer());
  const file = new File([buffer], name, { type: mimeType });
  const mediaUri = await uploadToArweave(file);

  const arweaveUri = await uploadJson({
    name,
    image: mediaUri,
    content: {
      mime: mimeType,
      uri: mediaUri,
    },
  });

  return {
    uri: arweaveUri,
    name,
  };
};

export default uploadMetadata;
