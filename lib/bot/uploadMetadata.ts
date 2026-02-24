import { uploadJson } from '../arweave/uploadJson';
import uploadToArweave from '../arweave/uploadToArweave';
import TelegramBot from 'node-telegram-bot-api';
import uploadFile from './uploadFile';
import uploadVideoToMux from '../mux/uploadVideoToMux';

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
  if (!photoId && !videoId) throw new Error('No photo or video provided');
  let imageUri = '';
  let animationUri = '';
  let downloadUri = '';
  let contentMimeType = '';

  if (photoId) {
    const { buffer, mimeType } = await uploadFile(photoId);
    imageUri = await uploadToArweave(buffer, mimeType);
    contentMimeType = mimeType;
  }
  if (videoId) {
    const { buffer, mimeType } = await uploadFile(videoId);
    const { playbackUrl, downloadUrl } = await uploadVideoToMux(
      buffer,
      mimeType
    );
    animationUri = playbackUrl;
    downloadUri = downloadUrl;
    contentMimeType = mimeType;
  }

  const name = text || `moment-${Date.now()}`;

  const arweaveUri = await uploadJson({
    name,
    image: imageUri,
    ...(animationUri && { animation_url: animationUri }),
    content: {
      mime: contentMimeType,
      uri: downloadUri || animationUri || imageUri,
    },
  });

  return {
    uri: arweaveUri,
    name,
    mimeType: contentMimeType,
    imageUri,
    animationUri,
  };
};

export default uploadMetadata;
