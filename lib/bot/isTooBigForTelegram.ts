import TelegramBot from 'node-telegram-bot-api';

const TWENTY_MB = 20 * 1024 * 1024;
export const TOO_BIG_MESSAGE =
  '⚠️ Telegram has a 20MB limit. You can upload larger media here: https://inprocess.world/create';

const isTooBigForTelegram = (
  video?: TelegramBot.Video,
  photo?: TelegramBot.PhotoSize[]
): boolean => {
  const fileSize = video?.file_size ?? photo?.[photo.length - 1]?.file_size;
  return !!fileSize && fileSize > TWENTY_MB;
};

export default isTooBigForTelegram;
