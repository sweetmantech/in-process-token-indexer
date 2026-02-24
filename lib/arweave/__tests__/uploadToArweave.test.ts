import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockUploadFile = vi.hoisted(() => vi.fn());

vi.mock('../client', () => ({ default: { uploadFile: mockUploadFile } }));

import uploadToArweave from '../uploadToArweave';

describe('uploadToArweave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('throws immediately on non-retryable error', async () => {
    mockUploadFile.mockRejectedValue(new Error('network error'));
    await expect(
      uploadToArweave(Buffer.from('data'), 'image/jpeg')
    ).rejects.toThrow('network error');
    expect(mockUploadFile).toHaveBeenCalledTimes(1);
  });

  describe('retry on 504 / gateway timeout', () => {
    it('retries and succeeds after a 504 error', async () => {
      mockUploadFile
        .mockRejectedValueOnce(
          new Error('504 Gateway Timeout from error.c.cdn77.org')
        )
        .mockResolvedValueOnce({ id: 'retry-tx-id' });

      const promise = uploadToArweave(Buffer.from('data'), 'image/jpeg');
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('ar://retry-tx-id');
      expect(mockUploadFile).toHaveBeenCalledTimes(2);
    });

    it('retries on "gateway timeout" in error message', async () => {
      mockUploadFile
        .mockRejectedValueOnce(new Error('Gateway Timeout'))
        .mockResolvedValueOnce({ id: 'tx-id' });

      const promise = uploadToArweave(Buffer.from('data'), 'image/jpeg');
      await vi.runAllTimersAsync();
      await promise;

      expect(mockUploadFile).toHaveBeenCalledTimes(2);
    });

    it('retries on cdn77 in error message', async () => {
      mockUploadFile
        .mockRejectedValueOnce(new Error('error from error.c.cdn77.org'))
        .mockResolvedValueOnce({ id: 'tx-id' });

      const promise = uploadToArweave(Buffer.from('data'), 'image/jpeg');
      await vi.runAllTimersAsync();
      await promise;

      expect(mockUploadFile).toHaveBeenCalledTimes(2);
    });

    it('throws after exhausting all 5 retries', async () => {
      mockUploadFile.mockRejectedValue(new Error('504 Gateway Timeout'));

      const promise = uploadToArweave(Buffer.from('data'), 'image/jpeg');
      const assertion = expect(promise).rejects.toThrow('504 Gateway Timeout');
      await vi.runAllTimersAsync();
      await assertion;

      expect(mockUploadFile).toHaveBeenCalledTimes(6); // 1 initial + 5 retries
    });

    it('does not retry on unrelated errors', async () => {
      mockUploadFile.mockRejectedValue(new Error('insufficient funds'));

      await expect(
        uploadToArweave(Buffer.from('data'), 'image/jpeg')
      ).rejects.toThrow('insufficient funds');
      expect(mockUploadFile).toHaveBeenCalledTimes(1);
    });
  });
});
