import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IndexConfig } from '@/types/factory';

const mockQueryGrpc = vi.fn();
const mockSleep = vi.fn();

vi.mock('@/lib/grpc/queryGrpc', () => ({
  queryGrpc: (...args: unknown[]) => mockQueryGrpc(...args),
}));

vi.mock('@/lib/sleep', () => ({
  sleep: (...args: unknown[]) => mockSleep(...args),
}));

vi.mock('@/lib/consts', () => ({
  INDEX_INTERVAL_MS: 1000,
  INDEX_INTERVAL_EMPTY_MS: 1500,
  PAGE_LIMIT: 2,
}));

const makeIndexer = (
  name: string,
  dataPath: string,
  maxTimestamp: number | null = null
): IndexConfig<unknown> => ({
  processBatchFn: vi.fn().mockResolvedValue(undefined),
  selectMaxTimestampFn: vi.fn().mockResolvedValue(maxTimestamp),
  indexName: name,
  dataPath,
  queryFragment: `${dataPath}(limit: $limit) { id }`,
});

class StopSignal extends Error {
  constructor() {
    super('stop');
  }
}

// Sleep throws StopSignal on first call to break the while(true) loop.
// Must always reject so the catch branch doesn't loop back.
const stopAfterOneCycle = () => {
  mockSleep.mockRejectedValue(new StopSignal());
};

import { executeIndexers } from '@/lib/indexers/executeIndexers';

let testIndexers: IndexConfig<unknown>[] = [];
vi.mock('@/lib/indexers/indexers', () => ({
  get indexers() {
    return testIndexers;
  },
}));

describe('executeIndexers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testIndexers = [];
    stopAfterOneCycle();
  });

  it('calls selectMaxTimestampFn for all indexers', async () => {
    const admins = makeIndexer('admins', 'InProcess_Admins');
    const moments = makeIndexer('moments', 'InProcess_Moments');
    testIndexers = [admins, moments];

    mockQueryGrpc.mockResolvedValue({});

    await executeIndexers().catch(() => {});

    expect(admins.selectMaxTimestampFn).toHaveBeenCalledOnce();
    expect(moments.selectMaxTimestampFn).toHaveBeenCalledOnce();
  });

  it('calls processBatchFn with returned entities', async () => {
    const admins = makeIndexer('admins', 'InProcess_Admins');
    testIndexers = [admins];

    mockQueryGrpc.mockResolvedValueOnce({ InProcess_Admins: [{ id: '1' }] });

    await executeIndexers().catch(() => {});

    expect(admins.processBatchFn).toHaveBeenCalledWith([{ id: '1' }]);
  });

  it('paginates when entity count equals PAGE_LIMIT', async () => {
    const admins = makeIndexer('admins', 'InProcess_Admins');
    testIndexers = [admins];

    // First call: 2 entities (= PAGE_LIMIT), triggers next page
    mockQueryGrpc.mockResolvedValueOnce({
      InProcess_Admins: [{ id: '1' }, { id: '2' }],
    });
    // Second call: 1 entity (< PAGE_LIMIT), stops pagination
    mockQueryGrpc.mockResolvedValueOnce({
      InProcess_Admins: [{ id: '3' }],
    });

    await executeIndexers().catch(() => {});

    expect(mockQueryGrpc).toHaveBeenCalledTimes(2);
    expect(admins.processBatchFn).toHaveBeenCalledTimes(2);
  });

  it('drops indexers that return empty results', async () => {
    const admins = makeIndexer('admins', 'InProcess_Admins');
    const moments = makeIndexer('moments', 'InProcess_Moments');
    testIndexers = [admins, moments];

    // admins returns PAGE_LIMIT entities, moments returns 0
    mockQueryGrpc.mockResolvedValueOnce({
      InProcess_Admins: [{ id: '1' }, { id: '2' }],
      InProcess_Moments: [],
    });
    // Second call: only admins queried, returns < PAGE_LIMIT
    mockQueryGrpc.mockResolvedValueOnce({
      InProcess_Admins: [{ id: '3' }],
    });

    await executeIndexers().catch(() => {});

    expect(admins.processBatchFn).toHaveBeenCalledTimes(2);
    expect(moments.processBatchFn).not.toHaveBeenCalled();
  });

  it('sleeps with INDEX_INTERVAL_EMPTY_MS when no data found', async () => {
    const admins = makeIndexer('admins', 'InProcess_Admins');
    testIndexers = [admins];

    mockQueryGrpc.mockResolvedValueOnce({ InProcess_Admins: [] });

    await executeIndexers().catch(() => {});

    expect(mockSleep).toHaveBeenCalledWith(1500);
  });

  it('sleeps with INDEX_INTERVAL_MS when data was found', async () => {
    const admins = makeIndexer('admins', 'InProcess_Admins');
    testIndexers = [admins];

    mockQueryGrpc.mockResolvedValueOnce({
      InProcess_Admins: [{ id: '1' }],
    });

    await executeIndexers().catch(() => {});

    expect(mockSleep).toHaveBeenCalledWith(1000);
  });
});
