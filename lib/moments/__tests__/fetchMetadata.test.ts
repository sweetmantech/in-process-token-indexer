import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchMetadata } from '@/lib/moments/fetchMetadata';

describe('fetchMetadata', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns response on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    );

    const result = await fetchMetadata('ipfs://test-uri');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
  });

  it('retries on failure and succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response('error', { status: 500 }))
        .mockResolvedValueOnce(new Response('{}', { status: 200 }))
    );

    const promise = fetchMetadata('ipfs://test-uri');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });

  it('returns last failed response after max attempts (5)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('error', { status: 500 }))
    );

    const promise = fetchMetadata('ipfs://test-uri');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(fetch).toHaveBeenCalledTimes(5);
    expect(result.ok).toBe(false);
  });

  it('throws on network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network error'))
    );

    const promise = fetchMetadata('ipfs://test-uri');
    const assertion = expect(promise).rejects.toThrow('network error');
    await vi.advanceTimersByTimeAsync(20_000);
    await assertion;
  });
});
