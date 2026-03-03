import { describe, it, expect, vi, beforeEach } from 'vitest';
import TelegramBot from 'node-telegram-bot-api';

const mockSendMessage = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockSelectArtist = vi.hoisted(() => vi.fn());
const mockGetPendingMedia = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined)
);
const mockHandlePendingMedia = vi.hoisted(() =>
  vi.fn().mockResolvedValue(false)
);
const mockHandleNewMedia = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined)
);
const mockLogMessage = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockBot = vi.hoisted(() => ({ on: vi.fn() }));
const mockSetBot = vi.hoisted(() => vi.fn().mockResolvedValue(mockBot));

vi.mock('@/lib/bot/bot', () => ({ setBot: mockSetBot }));
vi.mock('@/lib/bot/sendMessage', () => ({ sendMessage: mockSendMessage }));
vi.mock('@/lib/supabase/in_process_artists/selectArtist', () => ({
  selectArtist: mockSelectArtist,
}));
vi.mock('@/lib/bot/getPendingMedia', () => ({
  getPendingMedia: mockGetPendingMedia,
}));
vi.mock('@/lib/bot/handlePendingMedia', () => ({
  handlePendingMedia: mockHandlePendingMedia,
}));
vi.mock('@/lib/bot/handleNewMedia', () => ({
  handleNewMedia: mockHandleNewMedia,
}));
vi.mock('@/lib/bot/logMessage', () => ({ logMessage: mockLogMessage }));

import { runBot } from '@/lib/bot/start';

const mockChatId = 12345;
const mockSender = 'testuser';

const makeMsg = (text: string): TelegramBot.Message => ({
  message_id: 1,
  chat: { id: mockChatId, type: 'private', username: mockSender },
  date: Date.now(),
  text,
});

describe('runBot - /start command', () => {
  let messageHandler: (msg: TelegramBot.Message) => Promise<void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSetBot.mockResolvedValue(mockBot);
    mockGetPendingMedia.mockResolvedValue(undefined);
    mockHandlePendingMedia.mockResolvedValue(false);

    await runBot();

    const onCall = mockBot.on.mock.calls.find(
      (call: unknown[]) => call[0] === 'message'
    );
    messageHandler = onCall![1];
  });

  describe('unregistered user sends /start', () => {
    beforeEach(() => {
      mockSelectArtist.mockResolvedValue(null);
    });

    it('sends generic welcome message with link', async () => {
      await messageHandler(makeMsg('/start'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        mockChatId,
        expect.stringContaining('https://inprocess.world/manage')
      );
    });

    it('does not call handleNewMedia', async () => {
      await messageHandler(makeMsg('/start'));

      expect(mockHandleNewMedia).not.toHaveBeenCalled();
    });
  });

  describe('registered artist sends /start', () => {
    const mockArtist = {
      address: '0x1234567890123456789012345678901234567890',
      username: 'artistname',
    };

    it('sends personalized welcome message with artist username', async () => {
      mockSelectArtist.mockResolvedValue(mockArtist);

      await messageHandler(makeMsg('/start'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        mockChatId,
        `Hello ${mockArtist.username}, welcome to In Process! Your telegram has been verified! You can now text photos and captions to post them on In Process.`
      );
    });

    it('falls back to sender when artist has no username', async () => {
      mockSelectArtist.mockResolvedValue({ ...mockArtist, username: null });

      await messageHandler(makeMsg('/start'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        mockChatId,
        `Hello ${mockSender}, welcome to In Process! Your telegram has been verified! You can now text photos and captions to post them on In Process.`
      );
    });

    it('does not call getPendingMedia', async () => {
      mockSelectArtist.mockResolvedValue(mockArtist);

      await messageHandler(makeMsg('/start'));

      expect(mockGetPendingMedia).not.toHaveBeenCalled();
    });

    it('does not call handleNewMedia', async () => {
      mockSelectArtist.mockResolvedValue(mockArtist);

      await messageHandler(makeMsg('/start'));

      expect(mockHandleNewMedia).not.toHaveBeenCalled();
    });

    it('logs the welcome message', async () => {
      mockSelectArtist.mockResolvedValue(mockArtist);

      await messageHandler(makeMsg('/start'));

      expect(mockLogMessage).toHaveBeenCalledWith(
        [
          {
            type: 'text',
            text: `Hello ${mockArtist.username}, welcome to In Process! Your telegram has been verified! You can now text photos and captions to post them on In Process.`,
          },
        ],
        'assistant'
      );
    });
  });
});
