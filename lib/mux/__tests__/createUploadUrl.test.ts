import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node-fetch', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  IN_PROCESS_API: 'https://api.test',
  IN_PROCESS_API_KEY: 'test-key',
}));

import fetch from 'node-fetch';
import createUploadUrl from '@/lib/mux/createUploadUrl';

const mockFetch = vi.mocked(fetch);

const mockResponse = (body: unknown, ok = true, status = 200) =>
  ({ ok, status, json: async () => body }) as any;

describe('createUploadUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns uploadURL and uploadId on success', async () => {
    mockFetch.mockResolvedValue(
      mockResponse({
        uploadURL: 'https://mux.upload/url',
        uploadId: 'upload-abc',
      })
    );

    const result = await createUploadUrl();

    expect(result).toEqual({
      uploadURL: 'https://mux.upload/url',
      uploadId: 'upload-abc',
    });
  });

  it('sends POST to /mux/create with correct headers', async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ uploadURL: 'https://u', uploadId: 'id' })
    );

    await createUploadUrl();

    expect(mockFetch).toHaveBeenCalledWith('https://api.test/mux/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'test-key',
      },
    });
  });

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValue(mockResponse({}, false, 500));

    await expect(createUploadUrl()).rejects.toThrow(
      'Failed to create Mux upload URL'
    );
  });
});
