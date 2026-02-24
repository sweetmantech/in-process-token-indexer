import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateUploadUrl = vi.hoisted(() => vi.fn());
const mockPollMuxAsset = vi.hoisted(() => vi.fn());

vi.mock('node-fetch', () => ({ default: vi.fn() }));
vi.mock('@/lib/mux/createUploadUrl', () => ({ default: mockCreateUploadUrl }));
vi.mock('@/lib/mux/pollMuxAsset', () => ({ default: mockPollMuxAsset }));

import fetch from 'node-fetch';
import uploadVideoToMux from '@/lib/mux/uploadVideoToMux';

const mockFetch = vi.mocked(fetch);

const mockPutResponse = (ok = true, statusText = 'OK') =>
  ({ ok, statusText }) as any;

const uploadResult = {
  playbackUrl: 'https://stream.mux.com/abc.m3u8',
  assetId: 'asset-123',
  downloadUrl: 'https://download.mux.com/abc.mp4',
};

describe('uploadVideoToMux', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateUploadUrl.mockResolvedValue({
      uploadURL: 'https://mux.upload/signed-url',
      uploadId: 'upload-abc',
    });
    mockPollMuxAsset.mockResolvedValue(uploadResult);
  });

  it('returns the poll result on success', async () => {
    mockFetch.mockResolvedValue(mockPutResponse());

    const result = await uploadVideoToMux(Buffer.from('video'), 'video/mp4');

    expect(result).toEqual(uploadResult);
  });

  it('PUTs the buffer to the uploadURL with correct headers', async () => {
    const buffer = Buffer.from('video data');
    mockFetch.mockResolvedValue(mockPutResponse());

    await uploadVideoToMux(buffer, 'video/mp4');

    expect(mockFetch).toHaveBeenCalledWith('https://mux.upload/signed-url', {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4' },
      body: buffer,
    });
  });

  it('passes the uploadId from createUploadUrl to pollMuxAsset', async () => {
    mockFetch.mockResolvedValue(mockPutResponse());

    await uploadVideoToMux(Buffer.from('video'), 'video/mp4');

    expect(mockPollMuxAsset).toHaveBeenCalledWith('upload-abc');
  });

  it('throws when PUT to Mux fails', async () => {
    mockFetch.mockResolvedValue(mockPutResponse(false, 'Bad Request'));

    await expect(
      uploadVideoToMux(Buffer.from('video'), 'video/mp4')
    ).rejects.toThrow('Failed to upload video to Mux: Bad Request');
  });

  it('does not call pollMuxAsset when PUT fails', async () => {
    mockFetch.mockResolvedValue(mockPutResponse(false, 'Forbidden'));

    await expect(
      uploadVideoToMux(Buffer.from('video'), 'video/mp4')
    ).rejects.toThrow();
    expect(mockPollMuxAsset).not.toHaveBeenCalled();
  });
});
