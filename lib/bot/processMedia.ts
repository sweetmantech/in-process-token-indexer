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

  try {
    if (photo)
      result = await processPhoto(artistAddress, photo, caption || text);
    if (video)
      result = await processVideo(artistAddress, video, caption || text);
  } catch (error: any) {
    const isTooBig = error?.message?.includes('file is too big');
    const userMessage = isTooBig
      ? '❌ Video is too large. Telegram bots can only download files up to 20MB. Please send a shorter clip.'
      : '❌ Failed to process your media. Please try again.';
    await sendMessage(chatId, userMessage);
    return undefined;
  }

  if (result) {
    const successMessage = `✅ Moment created! https://inprocess.world/sms/base:${result.contractAddress}/${result.tokenId}`;
    await sendMessage(chatId, successMessage);
  }

  return undefined;
};

export default processMedia;
