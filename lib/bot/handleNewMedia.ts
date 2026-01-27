import TelegramBot from 'node-telegram-bot-api';
import { Address } from 'viem';
import { sendMessage } from './sendMessage';
import processMedia from './processMedia';
import { requestTitle } from './requestTitle';
import { getMetadataFromMsg } from './getMetadataFromMsg';

interface HandleNewMediaParams {
  msg: TelegramBot.Message;
  artistAddress: Address;
}

export async function handleNewMedia({
  msg,
  artistAddress,
}: HandleNewMediaParams): Promise<void> {
  const { photo, video, caption, text } = getMetadataFromMsg(msg);
  const chatId = msg.chat.id;
  const hasCaptionOrText = !!(caption || text);
  if (photo || video) {
    if (hasCaptionOrText) {
      await sendMessage(
        chatId,
        '⏳ In Process will post your moment. Please wait a few seconds...'
      );
      await processMedia(artistAddress, msg);
      return;
    }
    // Request title by replying to the media message
    await requestTitle(chatId, msg.message_id, photo, video);
  } else {
    await sendMessage(
      chatId,
      'Please send a photo or video with a caption or text.'
    );
  }
}
