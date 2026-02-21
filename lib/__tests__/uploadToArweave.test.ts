import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockUploadFile = vi.hoisted(() => vi.fn());

vi.mock('@ardrive/turbo-sdk', () => ({
  TurboFactory: {
    authenticated: vi.fn(() => ({ uploadFile: mockUploadFile })),
  },
}));

vi.mock('../consts', () => ({
  ARWEAVE_KEY: { n: 'mock-key' },
}));

import { uploadToArweave } from '../uploadToArweave';

describe('uploadToArweave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ar:// URI with the uploaded id', async () => {
    mockUploadFile.mockResolvedValue({ id: 'test-tx-id' });
    const result = await uploadToArweave(
      Buffer.from('test data'),
      'image/jpeg'
    );
    expect(result).toBe('ar://test-tx-id');
  });

  it('passes the buffer via fileStreamFactory', async () => {
    mockUploadFile.mockResolvedValue({ id: 'abc' });
    const buffer = Buffer.from('hello');
    await uploadToArweave(buffer, 'image/png');
    const { fileStreamFactory } = mockUploadFile.mock.calls[0][0];
    expect(fileStreamFactory()).toBe(buffer);
  });

  it('passes buffer.length via fileSizeFactory', async () => {
    mockUploadFile.mockResolvedValue({ id: 'abc' });
    const buffer = Buffer.from('hello world');
    await uploadToArweave(buffer, 'text/plain');
    const { fileSizeFactory } = mockUploadFile.mock.calls[0][0];
    expect(fileSizeFactory()).toBe(buffer.length);
  });

  it('sets Content-Type tag to mimeType', async () => {
    mockUploadFile.mockResolvedValue({ id: 'abc' });
    await uploadToArweave(Buffer.from('data'), 'video/mp4');
    const { dataItemOpts } = mockUploadFile.mock.calls[0][0];
    expect(dataItemOpts.tags).toContainEqual({
      name: 'Content-Type',
      value: 'video/mp4',
    });
  });

  it('throws when uploadFile rejects', async () => {
    mockUploadFile.mockRejectedValue(new Error('network error'));
    await expect(
      uploadToArweave(Buffer.from('data'), 'image/jpeg')
    ).rejects.toThrow('network error');
  });
});
