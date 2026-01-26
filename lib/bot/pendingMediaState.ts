import TelegramBot from 'node-telegram-bot-api';
import { Address } from 'viem';

export type PendingMediaType = 'photo' | 'video';

export type PendingMedia = {
  artistAddress: Address;
  chatId: number;
  type: PendingMediaType;
  photo?: TelegramBot.PhotoSize[];
  video?: TelegramBot.Video;
  title?: string;
  waitingFor: 'title' | null;
};
