import { Address } from 'viem';
import processPhoto from './processPhoto';
import { sendMessage } from './sendMessage';
import processVideo from './processVideo';
import TelegramBot from 'node-telegram-bot-api';
import { CreateMomentResult } from '../api/createMomentApi';
import isTooBigForTelegram, { TOO_BIG_MESSAGE } from './isTooBigForTelegram';

const processMedia = async (
  artistAddress: Address,
  msg: TelegramBot.Message
) => {
  const photo = msg.photo;
  const video = msg.video;
  const text = msg?.text || '';
  const caption = msg?.caption || '';
  const chatId = msg.chat.id;

  if (isTooBigForTelegram(video, photo)) {
    await sendMessage(chatId, TOO_BIG_MESSAGE);
    return undefined;
  }

  let result: CreateMomentResult | undefined;

  try {
    if (photo)
      result = await processPhoto(artistAddress, photo, caption || text);
    if (video)
      result = await processVideo(artistAddress, video, caption || text);
  } catch (error: any) {
    const isTooBig = error?.message?.includes('file is too big');
    const userMessage = isTooBig
      ? TOO_BIG_MESSAGE
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
