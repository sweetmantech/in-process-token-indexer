import { Address } from 'viem';
import processPhoto from './processPhoto';
import { sendMessage } from './sendMessage';
import processVideo from './processVideo';
import TelegramBot from 'node-telegram-bot-api';
import { CreateMomentResult } from '../api/createMomentApi';

const processMedia = async (
  artistAddress: Address,
  msg: TelegramBot.Message
) => {
  const photo = msg.photo;
  const video = msg.video;
  const text = msg?.text || '';
  const caption = msg?.caption || '';
  const chatId = msg.chat.id;

  let result: CreateMomentResult | undefined;

  if (photo) result = await processPhoto(artistAddress, photo, caption || text);
  if (video) result = await processVideo(artistAddress, video, caption || text);

  if (result) {
    const successMessage = `✅ Moment created! https://inprocess.world/sms/base:${result.contractAddress}/${result.tokenId}`;
    await sendMessage(chatId, successMessage);
  }

  return undefined;
};

export default processMedia;
