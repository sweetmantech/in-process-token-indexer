import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUploadFile = vi.hoisted(() => vi.fn());
const mockUploadToArweave = vi.hoisted(() => vi.fn());
const mockUploadVideoToMux = vi.hoisted(() => vi.fn());
const mockUploadJson = vi.hoisted(() => vi.fn());

vi.mock('@/lib/bot/uploadFile', () => ({ default: mockUploadFile }));
vi.mock('@/lib/arweave/uploadToArweave', () => ({
  uploadToArweave: mockUploadToArweave,
  default: mockUploadToArweave,
}));
vi.mock('@/lib/mux/uploadVideoToMux', () => ({
  default: mockUploadVideoToMux,
}));
vi.mock('@/lib/arweave/uploadJson', () => ({ uploadJson: mockUploadJson }));

import uploadMetadata from '@/lib/bot/uploadMetadata';

const photoBuffer = Buffer.from('photo');
const videoBuffer = Buffer.from('video');

describe('uploadMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadFile.mockImplementation(async (fileId: string) => ({
      buffer: fileId.includes('video') ? videoBuffer : photoBuffer,
      mimeType: fileId.includes('video') ? 'video/mp4' : 'image/jpeg',
    }));
    mockUploadToArweave.mockResolvedValue('ar://image-tx');
    mockUploadVideoToMux.mockResolvedValue({
      playbackUrl: 'https://stream.mux.com/abc.m3u8',
      assetId: 'asset-123',
      downloadUrl: 'https://download.mux.com/abc.mp4',
    });
    mockUploadJson.mockResolvedValue('ar://metadata-tx');
  });

  it('throws when neither photoId nor videoId is provided', async () => {
    await expect(uploadMetadata({ text: 'hello' })).rejects.toThrow(
      'No photo or video provided'
    );
  });

  describe('photo only', () => {
    it('returns uri, name, mimeType, imageUri, animationUri', async () => {
      const result = await uploadMetadata({
        photoId: 'photo-id',
        text: 'my photo',
      });

      expect(result).toEqual({
        uri: 'ar://metadata-tx',
        name: 'my photo',
        mimeType: 'image/jpeg',
        imageUri: 'ar://image-tx',
        animationUri: '',
      });
    });

    it('uploads photo to Arweave and sets imageUri', async () => {
      await uploadMetadata({ photoId: 'photo-id' });

      expect(mockUploadToArweave).toHaveBeenCalledWith(
        photoBuffer,
        'image/jpeg'
      );
    });

    it('does not call uploadVideoToMux', async () => {
      await uploadMetadata({ photoId: 'photo-id' });

      expect(mockUploadVideoToMux).not.toHaveBeenCalled();
    });

    it('uploads JSON with image uri and no animation_url', async () => {
      await uploadMetadata({ photoId: 'photo-id', text: 'caption' });

      expect(mockUploadJson).toHaveBeenCalledWith(
        expect.objectContaining({
          image: 'ar://image-tx',
          content: { mime: 'image/jpeg', uri: 'ar://image-tx' },
        })
      );
      expect(mockUploadJson).toHaveBeenCalledWith(
        expect.not.objectContaining({ animation_url: expect.anything() })
      );
    });
  });

  describe('video only', () => {
    it('returns uri, name, mimeType, imageUri, animationUri', async () => {
      const result = await uploadMetadata({
        videoId: 'video-id',
        text: 'my video',
      });

      expect(result).toEqual({
        uri: 'ar://metadata-tx',
        name: 'my video',
        mimeType: 'video/mp4',
        imageUri: '',
        animationUri: 'https://stream.mux.com/abc.m3u8',
      });
    });

    it('uploads video to Mux and sets animationUri to playbackUrl', async () => {
      await uploadMetadata({ videoId: 'video-id' });

      expect(mockUploadVideoToMux).toHaveBeenCalledWith(
        videoBuffer,
        'video/mp4'
      );
    });

    it('does not call uploadToArweave', async () => {
      await uploadMetadata({ videoId: 'video-id' });

      expect(mockUploadToArweave).not.toHaveBeenCalled();
    });

    it('uploads JSON with animation_url set to Mux playback URL', async () => {
      await uploadMetadata({ videoId: 'video-id', text: 'caption' });

      expect(mockUploadJson).toHaveBeenCalledWith(
        expect.objectContaining({
          animation_url: 'https://stream.mux.com/abc.m3u8',
          content: {
            mime: 'video/mp4',
            uri: 'https://stream.mux.com/abc.m3u8',
          },
        })
      );
    });
  });

  describe('photo + video (thumbnail + video)', () => {
    it('uploads thumbnail to Arweave and video to Mux', async () => {
      await uploadMetadata({ photoId: 'photo-thumb', videoId: 'video-id' });

      expect(mockUploadToArweave).toHaveBeenCalledWith(
        photoBuffer,
        'image/jpeg'
      );
      expect(mockUploadVideoToMux).toHaveBeenCalledWith(
        videoBuffer,
        'video/mp4'
      );
    });

    it('sets imageUri from Arweave and animationUri from Mux', async () => {
      const result = await uploadMetadata({
        photoId: 'photo-thumb',
        videoId: 'video-id',
      });

      expect(result.imageUri).toBe('ar://image-tx');
      expect(result.animationUri).toBe('https://stream.mux.com/abc.m3u8');
    });

    it('mimeType is taken from video', async () => {
      const result = await uploadMetadata({
        photoId: 'photo-thumb',
        videoId: 'video-id',
      });

      expect(result.mimeType).toBe('video/mp4');
    });
  });

  describe('name fallback', () => {
    it('uses text as name when provided', async () => {
      const result = await uploadMetadata({
        photoId: 'photo-id',
        text: 'sunset',
      });

      expect(result.name).toBe('sunset');
    });

    it('falls back to moment-<timestamp> when text is empty', async () => {
      const result = await uploadMetadata({ photoId: 'photo-id', text: '' });

      expect(result.name).toMatch(/^moment-\d+$/);
    });
  });
});
