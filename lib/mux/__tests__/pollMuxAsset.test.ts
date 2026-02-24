import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockApiUrl = vi.hoisted(() => ({
  value: 'https://api.test' as string | undefined,
}));

vi.mock('node-fetch', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  get IN_PROCESS_API() {
    return mockApiUrl.value;
  },
}));
vi.mock('@/lib/mux/uploadVideoToMux', () => ({}));

import fetch from 'node-fetch';
import pollMuxAsset from '@/lib/mux/pollMuxAsset';

const mockFetch = vi.mocked(fetch);

const mockResponse = (body: unknown, ok = true, status = 200, textBody = '') =>
  ({ ok, status, json: async () => body, text: async () => textBody }) as any;

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
    mockApiUrl.value = 'https://api.test';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws when IN_PROCESS_API is not set', async () => {
    mockApiUrl.value = undefined;
    await expect(pollMuxAsset('upload-123')).rejects.toThrow(
      'IN_PROCESS_API is not set'
    );
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

  it('URL-encodes the uploadId', async () => {
    mockFetch.mockResolvedValue(mockResponse(readyAsset));

    const promise = pollMuxAsset('upload/123+abc');
    await vi.runAllTimersAsync();
    await promise;

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test/mux/asset?uploadId=upload%2F123%2Babc'
    );
  });

  it('retries on non-ok response and resolves when later poll succeeds', async () => {
    mockFetch
      .mockResolvedValueOnce(
        mockResponse({}, false, 503, 'Service Unavailable')
      )
      .mockResolvedValueOnce(mockResponse(readyAsset));

    const promise = pollMuxAsset('upload-123');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.playbackUrl).toBe(readyAsset.playbackUrl);
    expect(mockFetch).toHaveBeenCalledTimes(2);
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
    const assertion = expect(promise).rejects.toThrow(
      'Mux asset processing timeout'
    );
    await vi.runAllTimersAsync();
    await assertion;
  });
});
