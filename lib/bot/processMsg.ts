import { Address } from 'viem';
import processPhoto from './processPhoto';
import { sendMessage } from './sendMessage';
import processVideo from './processVideo';
import TelegramBot from 'node-telegram-bot-api';
import { CreateMomentResult } from '@/lib/api/createMomentApi';

const processMsg = async (artistAddress: Address, msg: TelegramBot.Message) => {
  const photo = msg.photo;
  const text = msg?.text || '';
  const caption = msg?.caption || '';
  const chatId = msg.chat.id;
  let result: CreateMomentResult | undefined;

  if (photo) {
    result = await processPhoto(artistAddress, photo, caption || text);
  }
  const video = msg.video;
  if (video) {
    result = await processVideo(artistAddress, video, caption || text);
  }

  if (result) {
    await sendMessage(
      chatId,
      `Moment created! https://inprocess.world/sms/base:${result.contractAddress}/${result.tokenId}`
    );
  }

  return result;
};

export default processMsg;
