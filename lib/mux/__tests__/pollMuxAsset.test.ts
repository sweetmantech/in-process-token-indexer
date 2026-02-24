import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node-fetch', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  IN_PROCESS_API: 'https://api.test',
}));
vi.mock('@/lib/mux/uploadVideoToMux', () => ({}));

import fetch from 'node-fetch';
import pollMuxAsset from '@/lib/mux/pollMuxAsset';

const mockFetch = vi.mocked(fetch);

const mockResponse = (body: unknown, ok = true) =>
  ({ ok, json: async () => body }) as any;

const readyAsset = {
  playbackUrl: 'https://stream.mux.com/abc.m3u8',
  assetId: 'asset-123',
  downloadUrl: 'https://download.mux.com/abc.mp4',
  status: 'ready',
};

describe('pollMuxAsset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves immediately when first poll returns ready', async () => {
    mockFetch.mockResolvedValue(mockResponse(readyAsset));

    const promise = pollMuxAsset('upload-123');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toEqual({
      playbackUrl: readyAsset.playbackUrl,
      assetId: readyAsset.assetId,
      downloadUrl: readyAsset.downloadUrl,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('polls GET /mux/asset with uploadId', async () => {
    mockFetch.mockResolvedValue(mockResponse(readyAsset));

    const promise = pollMuxAsset('upload-xyz');
    await vi.runAllTimersAsync();
    await promise;

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test/mux/asset?uploadId=upload-xyz'
    );
  });

  it('retries until status is ready', async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse({ status: 'processing' }))
      .mockResolvedValueOnce(mockResponse({ status: 'processing' }))
      .mockResolvedValueOnce(mockResponse(readyAsset));

    const promise = pollMuxAsset('upload-123');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.playbackUrl).toBe(readyAsset.playbackUrl);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('defaults assetId and downloadUrl to empty string when missing', async () => {
    mockFetch.mockResolvedValue(
      mockResponse({
        playbackUrl: 'https://stream.mux.com/x.m3u8',
        status: 'ready',
      })
    );

    const promise = pollMuxAsset('upload-123');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.assetId).toBe('');
    expect(result.downloadUrl).toBe('');
  });

  it('throws after exhausting all retries', async () => {
    mockFetch.mockResolvedValue(mockResponse({ status: 'processing' }));

    const promise = pollMuxAsset('upload-123');
    // Attach rejection handler before advancing timers to avoid unhandled rejection warning
    const assertion = expect(promise).rejects.toThrow(
      'Mux asset processing timeout'
    );
    await vi.runAllTimersAsync();
    await assertion;
  });
});
