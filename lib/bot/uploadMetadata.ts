import { uploadJson } from '../uploadJson';
import uploadToArweave from '../uploadToArweave';
import TelegramBot from 'node-telegram-bot-api';
import uploadFile from './uploadFile';

const uploadMetadata = async ({
  photoId,
  videoId,
  text,
}: {
  photoId?: string;
  videoId?: string;
  video?: TelegramBot.Video;
  text?: string;
}) => {
  let imageUri = '';
  let animationUri = '';
  let contentMimeType = '';

  if (photoId) {
    const { file, mimeType } = await uploadFile(photoId);
    imageUri = await uploadToArweave(file);
    contentMimeType = mimeType;
  }
  if (videoId) {
    const { file, mimeType } = await uploadFile(videoId);
    animationUri = await uploadToArweave(file);
    contentMimeType = mimeType;
  }

  const name = text || `photo-${Date.now()}`;

  const arweaveUri = await uploadJson({
    name,
    image: imageUri,
    ...(animationUri && { animation_url: animationUri }),
    content: {
      mime: contentMimeType,
      uri: animationUri || imageUri,
    },
  });

  return {
    uri: arweaveUri,
    name,
  };
};

export default uploadMetadata;
