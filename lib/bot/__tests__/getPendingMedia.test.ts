import { describe, it, expect, vi, beforeEach } from 'vitest';
import TelegramBot from 'node-telegram-bot-api';
import { getPendingMedia } from '@/lib/bot/getPendingMedia';
import { getBot } from '@/lib/bot/bot';
import { Address } from 'viem';
import { encodeMediaInfo } from '@/lib/bot/encodeMediaInfo';

// Mock the bot module
vi.mock('@/lib/bot/bot', () => ({
  getBot: vi.fn(),
}));

describe('getPendingMedia', () => {
  const mockArtistAddress =
    '0x1234567890123456789012345678901234567890' as Address;
  const mockChatId = 12345;
  const mockFileId = 'AgACAgIAAxkBAAIBY2Z...';
  const mockFileUniqueId = 'CQACAgIAAxkBAAIBY2Z...';

  let mockBot: {
    getFile: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBot = {
      getFile: vi.fn(),
    };
    vi.mocked(getBot).mockReturnValue(mockBot as unknown as TelegramBot);
  });

  it('should return undefined if message is not a reply', async () => {
    const msg: TelegramBot.Message = {
      message_id: 1,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result).toBeUndefined();
  });

  it('should return undefined if replied message is not a title request', async () => {
    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
        text: 'This is just a regular message',
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result).toBeUndefined();
  });

  it('should return undefined if replied message has no text', async () => {
    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result).toBeUndefined();
  });

  it('should return undefined if title request message has no media info', async () => {
    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
        text: '📝 Please send the **title** for your moment:',
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result).toBeUndefined();
  });

  it('should return PendingMedia for photo when reply to valid title request', async () => {
    const mediaInfo = `MEDIA:photo:${mockFileId}`;
    const encodedMediaInfo = encodeMediaInfo(mediaInfo);
    const titleRequestText = `📝 Please send the **title** for your moment:\n${encodedMediaInfo}`;

    mockBot.getFile.mockResolvedValue({
      file_id: mockFileId,
      file_unique_id: mockFileUniqueId,
      file_size: 1024,
    });

    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
        text: titleRequestText,
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result).toBeDefined();
    expect(result?.type).toBe('photo');
    expect(result?.artistAddress).toBe(mockArtistAddress);
    expect(result?.chatId).toBe(mockChatId);
    expect(result?.waitingFor).toBe('title'); // No text in reply, so still waiting
    expect(result?.photo).toBeDefined();
    expect(result?.photo?.[0]?.file_id).toBe(mockFileId);
    expect(result?.video).toBeUndefined();
    expect(mockBot.getFile).toHaveBeenCalledWith(mockFileId);
  });

  it('should return PendingMedia for video when reply to valid title request', async () => {
    const mediaInfo = `MEDIA:video:${mockFileId}`;
    const encodedMediaInfo = encodeMediaInfo(mediaInfo);
    const titleRequestText = `📝 Please send the **title** for your moment:\n${encodedMediaInfo}`;

    mockBot.getFile.mockResolvedValue({
      file_id: mockFileId,
      file_unique_id: mockFileUniqueId,
      file_size: 2048,
    });

    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
        text: titleRequestText,
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result).toBeDefined();
    expect(result?.type).toBe('video');
    expect(result?.artistAddress).toBe(mockArtistAddress);
    expect(result?.chatId).toBe(mockChatId);
    expect(result?.waitingFor).toBe('title'); // No text in reply, so still waiting
    expect(result?.video).toBeDefined();
    expect(result?.video?.file_id).toBe(mockFileId);
    expect(result?.photo).toBeUndefined();
    expect(mockBot.getFile).toHaveBeenCalledWith(mockFileId);
  });

  it('should return PendingMedia with title when reply includes text', async () => {
    const mediaInfo = `MEDIA:photo:${mockFileId}`;
    const encodedMediaInfo = encodeMediaInfo(mediaInfo);
    const titleRequestText = `📝 Please send the **title** for your moment:\n${encodedMediaInfo}`;

    mockBot.getFile.mockResolvedValue({
      file_id: mockFileId,
      file_unique_id: mockFileUniqueId,
      file_size: 1024,
    });

    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      text: 'My Title',
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
        text: titleRequestText,
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result).toBeDefined();
    expect(result?.type).toBe('photo');
    expect(result?.title).toBe('My Title');
    expect(result?.waitingFor).toBe(null); // Title provided, so not waiting
    expect(result?.photo?.[0]?.file_id).toBe(mockFileId);
  });

  it('should return undefined if bot is not available', async () => {
    vi.mocked(getBot).mockReturnValue(null);

    const mediaInfo = `MEDIA:photo:${mockFileId}`;
    const encodedMediaInfo = encodeMediaInfo(mediaInfo);
    const titleRequestText = `📝 Please send the **title** for your moment:\n${encodedMediaInfo}`;

    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
        text: titleRequestText,
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result).toBeUndefined();
  });

  it('should return undefined if file info cannot be retrieved', async () => {
    mockBot.getFile.mockResolvedValue(null);

    const mediaInfo = `MEDIA:photo:${mockFileId}`;
    const encodedMediaInfo = encodeMediaInfo(mediaInfo);
    const titleRequestText = `📝 Please send the **title** for your moment:\n${encodedMediaInfo}`;

    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
        text: titleRequestText,
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result).toBeUndefined();
  });

  it('should return undefined if getFile throws an error', async () => {
    mockBot.getFile.mockRejectedValue(new Error('File not found'));

    const mediaInfo = `MEDIA:photo:${mockFileId}`;
    const encodedMediaInfo = encodeMediaInfo(mediaInfo);
    const titleRequestText = `📝 Please send the **title** for your moment:\n${encodedMediaInfo}`;

    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
        text: titleRequestText,
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result).toBeUndefined();
  });

  it('should handle title request with "moment" keyword instead of "title"', async () => {
    const mediaInfo = `MEDIA:photo:${mockFileId}`;
    const encodedMediaInfo = encodeMediaInfo(mediaInfo);
    const titleRequestText = `📝 Please send the title for your moment:\n${encodedMediaInfo}`;

    mockBot.getFile.mockResolvedValue({
      file_id: mockFileId,
      file_unique_id: mockFileUniqueId,
      file_size: 1024,
    });

    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
        text: titleRequestText,
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result).toBeDefined();
    expect(result?.type).toBe('photo');
  });

  it('should correctly reconstruct photo object with file properties', async () => {
    const mediaInfo = `MEDIA:photo:${mockFileId}`;
    const encodedMediaInfo = encodeMediaInfo(mediaInfo);
    const titleRequestText = `📝 Please send the **title** for your moment:\n${encodedMediaInfo}`;

    mockBot.getFile.mockResolvedValue({
      file_id: mockFileId,
      file_unique_id: mockFileUniqueId,
      file_size: 5120,
    });

    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
        text: titleRequestText,
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result?.photo?.[0]).toMatchObject({
      file_id: mockFileId,
      file_unique_id: mockFileUniqueId,
      file_size: 5120,
      width: 0,
      height: 0,
    });
  });

  it('should correctly reconstruct video object with file properties', async () => {
    const mediaInfo = `MEDIA:video:${mockFileId}`;
    const encodedMediaInfo = encodeMediaInfo(mediaInfo);
    const titleRequestText = `📝 Please send the **title** for your moment:\n${encodedMediaInfo}`;

    mockBot.getFile.mockResolvedValue({
      file_id: mockFileId,
      file_unique_id: mockFileUniqueId,
      file_size: 10240,
    });

    const msg: TelegramBot.Message = {
      message_id: 2,
      chat: { id: mockChatId, type: 'private' },
      date: Date.now(),
      reply_to_message: {
        message_id: 1,
        chat: { id: mockChatId, type: 'private' },
        date: Date.now(),
        text: titleRequestText,
      },
    };

    const result = await getPendingMedia(msg, mockArtistAddress);

    expect(result?.video).toMatchObject({
      file_id: mockFileId,
      file_unique_id: mockFileUniqueId,
      file_size: 10240,
      width: 0,
      height: 0,
      duration: 0,
    });
  });
});
