import TelegramBot from 'node-telegram-bot-api';

export interface MessageMetadata {
  photo: TelegramBot.PhotoSize[] | undefined;
  video: TelegramBot.Video | undefined;
  text: string;
  caption: string;
}

export function getMetadataFromMsg(msg: TelegramBot.Message): MessageMetadata {
  const photo = msg.photo;
  const video = msg.video;
  const text = msg.text || '';
  const caption = msg.caption || '';

  return { photo, video, text, caption };
}
