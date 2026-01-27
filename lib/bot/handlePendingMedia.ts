import TelegramBot from 'node-telegram-bot-api';
import { sendMessage } from './sendMessage';
import { processPendingMedia } from './processPendingMedia';
import { PendingMedia } from './pendingMediaState';
import { getMetadataFromMsg } from './getMetadataFromMsg';

interface HandlePendingMediaParams {
  pending: PendingMedia;
  msg: TelegramBot.Message;
}

export async function handlePendingMedia({
  pending,
  msg,
}: HandlePendingMediaParams): Promise<boolean> {
  const { caption, text } = getMetadataFromMsg(msg);
  const chatId = msg.chat.id;
  const hasCaptionOrText = !!(caption || text);
  // If we have pending media with title already set (waitingFor === null), process it
  if (pending.waitingFor === null && pending.title) {
    await sendMessage(
      chatId,
      '⏳ In Process will post your moment. Please wait a few seconds...'
    );
    await processPendingMedia(pending);
    return true;
  }

  // If we're still waiting for title (waitingFor === 'title')
  if (pending.waitingFor === 'title') {
    if (hasCaptionOrText) {
      await sendMessage(
        chatId,
        '⏳ In Process will post your moment. Please wait a few seconds...'
      );
      pending.title = caption || text;
      pending.waitingFor = null;
      await processPendingMedia(pending);
    } else {
      // User replied but with no text, ask again
      await sendMessage(
        chatId,
        '📝 Please send the title as text (not a photo or video).'
      );
    }
    return true;
  }

  return false;
}
