import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processCollectorsInBatches } from '../processCollectorsInBatches';
import type { InProcess_Collectors_t } from '@/types/envio';

vi.mock('../mapCollectorsToSupabase', () => ({
  mapCollectorsToSupabase: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_collectors/upsertCollectors', () => ({
  upsertCollectors: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));

vi.mock('@/lib/consts', () => ({
  BATCH_SIZE: 2, // small batch size for testing
}));

import { mapCollectorsToSupabase } from '../mapCollectorsToSupabase';
import { upsertCollectors } from '@/lib/supabase/in_process_collectors/upsertCollectors';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';

const mockMapCollectors = vi.mocked(mapCollectorsToSupabase);
const mockUpsertCollectors = vi.mocked(upsertCollectors);
const mockEnsureArtists = vi.mocked(ensureArtists);

function makeCollector(id: string): InProcess_Collectors_t {
  return {
    id,
    collection: '0xabc',
    token_id: 1,
    amount: 1,
    chain_id: 8453,
    collector: '0xcollector',
    transaction_hash: '0xtxhash',
    collected_at: 1700000000,
  };
}

describe('processCollectorsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should process a single batch of collectors', async () => {
    const collectors = [makeCollector('1')];
    const mapped = [
      {
        moment: 'm1',
        collector: '0xcollector',
        amount: 1,
        transaction_hash: '0xtxhash',
        collected_at: '2023-11-14T22:13:20.000Z',
      },
    ];

    mockMapCollectors.mockResolvedValue(mapped);
    mockEnsureArtists.mockResolvedValue();
    mockUpsertCollectors.mockResolvedValue([]);

    await processCollectorsInBatches(collectors);

    expect(mockMapCollectors).toHaveBeenCalledTimes(1);
    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xcollector']);
    expect(mockUpsertCollectors).toHaveBeenCalledWith(mapped);
  });

  it('should split collectors into batches based on BATCH_SIZE', async () => {
    // BATCH_SIZE is mocked to 2, so 3 collectors = 2 batches
    const collectors = [
      makeCollector('1'),
      makeCollector('2'),
      makeCollector('3'),
    ];

    const mappedBatch = [
      {
        moment: 'm1',
        collector: '0xcollector',
        amount: 1,
        transaction_hash: '0xtxhash',
        collected_at: '2023-11-14T22:13:20.000Z',
      },
    ];

    mockMapCollectors.mockResolvedValue(mappedBatch);
    mockEnsureArtists.mockResolvedValue();
    mockUpsertCollectors.mockResolvedValue([]);

    await processCollectorsInBatches(collectors);

    expect(mockMapCollectors).toHaveBeenCalledTimes(2); // 2 batches
  });

  it('should deduplicate artist addresses before calling ensureArtists', async () => {
    const collectors = [makeCollector('1'), makeCollector('2')];
    const mapped = [
      {
        moment: 'm1',
        collector: '0xsame',
        amount: 1,
        transaction_hash: '0xtx1',
        collected_at: '2023-01-01T00:00:00.000Z',
      },
      {
        moment: 'm2',
        collector: '0xsame',
        amount: 2,
        transaction_hash: '0xtx2',
        collected_at: '2023-01-01T00:00:00.000Z',
      },
    ];

    mockMapCollectors.mockResolvedValue(mapped);
    mockEnsureArtists.mockResolvedValue();
    mockUpsertCollectors.mockResolvedValue([]);

    await processCollectorsInBatches(collectors);

    // Should deduplicate to a single address
    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xsame']);
  });

  it('should continue processing remaining batches when one fails', async () => {
    // 4 collectors with BATCH_SIZE=2 → 2 batches
    const collectors = [
      makeCollector('1'),
      makeCollector('2'),
      makeCollector('3'),
      makeCollector('4'),
    ];

    const mapped = [
      {
        moment: 'm1',
        collector: '0xcollector',
        amount: 1,
        transaction_hash: '0xtxhash',
        collected_at: '2023-01-01T00:00:00.000Z',
      },
    ];

    // First batch fails, second succeeds
    mockMapCollectors
      .mockRejectedValueOnce(new Error('batch 1 failed'))
      .mockResolvedValueOnce(mapped);
    mockEnsureArtists.mockResolvedValue();
    mockUpsertCollectors.mockResolvedValue([]);

    await processCollectorsInBatches(collectors);

    expect(mockMapCollectors).toHaveBeenCalledTimes(2);
    // upsert only called for the successful batch
    expect(mockUpsertCollectors).toHaveBeenCalledTimes(1);
  });

  it('should handle empty collectors array', async () => {
    await processCollectorsInBatches([]);

    expect(mockMapCollectors).not.toHaveBeenCalled();
    expect(mockUpsertCollectors).not.toHaveBeenCalled();
  });
});
