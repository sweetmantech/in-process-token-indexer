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

const pendingMediaMap = new Map<number, PendingMedia>();

export function setPendingMedia(media: PendingMedia): void {
  pendingMediaMap.set(media.chatId, media);
}

export function getPendingMedia(chatId: number): PendingMedia | undefined {
  return pendingMediaMap.get(chatId);
}

export function clearPendingMedia(chatId: number): void {
  pendingMediaMap.delete(chatId);
}
