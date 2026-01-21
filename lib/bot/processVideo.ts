import { Address } from 'viem';
import TelegramBot from 'node-telegram-bot-api';
import uploadMetadata from './uploadMetadata';
import getCreateParameter from '../getCreateParameter';
import { createMomentApi } from '../api/createMomentApi';

const processVideo = async (
  artistAddress: Address,
  video: TelegramBot.Video,
  text: string
) => {
  if (!video) return;
  const { uri, name } = await uploadMetadata({
    photoId: video.thumb?.file_id,
    videoId: video.file_id,
    text,
  });
  const parameters = await getCreateParameter(artistAddress, name, uri);
  const result = await createMomentApi(parameters);
  return result;
};

export default processVideo;
