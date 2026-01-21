import { Address } from 'viem';
import processPhoto from './processPhoto';
import { sendMessage } from './sendMessage';
import processVideo from './processVideo';
import TelegramBot from 'node-telegram-bot-api';

const processMedia = async (
  artistAddress: Address,
  msg: TelegramBot.Message
) => {
  const photo = msg.photo;
  const video = msg.video;
  const text = msg?.text || '';
  const caption = msg?.caption || '';
  const chatId = msg.chat.id;

  if (photo) {
    const result = await processPhoto(artistAddress, photo, caption || text);
    if (result) {
      await sendMessage(
        chatId,
        `✅ Moment created! https://inprocess.world/sms/base:${result.contractAddress}/${result.tokenId}`
      );
    }
    return result;
  }

  if (video) {
    const result = await processVideo(artistAddress, video, caption || text);
    if (result) {
      await sendMessage(
        chatId,
        `✅ Moment created! https://inprocess.world/sms/base:${result.contractAddress}/${result.tokenId}`
      );
    }
    return result;
  }

  return undefined;
};

export default processMedia;
