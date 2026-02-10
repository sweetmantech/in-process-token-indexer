import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InProcess_Collections_t } from '@/types/envio';

vi.mock('@/lib/consts', () => ({
  BATCH_SIZE: 3,
}));

const BATCH_SIZE = 3;
vi.mock('@/lib/collections/mapCollectionsToSupabase', () => ({
  mapCollectionsToSupabase: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_collections/upsertCollections', () => ({
  upsertCollections: vi.fn(),
}));
vi.mock('@/lib/socket/emitCollectionUpdated', () => ({
  emitCollectionUpdated: vi.fn(),
}));

import { processCollectionsInBatches } from '@/lib/collections/processCollectionsInBatches';
import { mapCollectionsToSupabase } from '@/lib/collections/mapCollectionsToSupabase';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import { emitCollectionUpdated } from '@/lib/socket/emitCollectionUpdated';

const makeCollection = (id: string): InProcess_Collections_t => ({
  id,
  address: `0x${id}`,
  chain_id: 8453,
  created_at: 1000,
  default_admin: `0xadmin${id}`,
  name: `Collection ${id}`,
  payout_recipient: `0xpayout${id}`,
  transaction_hash: `0xhash${id}`,
  updated_at: 2000,
  uri: `ar://${id}`,
});

describe('processCollectionsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapCollectionsToSupabase).mockReturnValue([
      { default_admin: '0xadmin' },
    ] as any);
    vi.mocked(ensureArtists).mockResolvedValue(undefined);
    vi.mocked(upsertCollections).mockResolvedValue([] as any);
  });

  it('calls emitCollectionUpdated after upsertCollections with the original batch', async () => {
    const collections = [makeCollection('1')];
    vi.mocked(upsertCollections).mockResolvedValue([{ id: '1' }] as any);

    await processCollectionsInBatches(collections);

    expect(upsertCollections).toHaveBeenCalledBefore(
      vi.mocked(emitCollectionUpdated)
    );
    expect(emitCollectionUpdated).toHaveBeenCalledWith(collections);
  });

  it('does not emit when upsert throws', async () => {
    const collections = [makeCollection('1')];
    vi.mocked(upsertCollections).mockRejectedValue(new Error('db error'));

    await processCollectionsInBatches(collections);

    expect(emitCollectionUpdated).not.toHaveBeenCalled();
  });

  it('emits for each batch separately when collections exceed BATCH_SIZE', async () => {
    const totalCollections = BATCH_SIZE * 2 + 1;
    const collections = Array.from({ length: totalCollections }, (_, i) =>
      makeCollection(String(i))
    );
    vi.mocked(upsertCollections).mockResolvedValue([{ id: '1' }] as any);

    await processCollectionsInBatches(collections);

    const expectedBatches = Math.ceil(totalCollections / BATCH_SIZE);
    expect(emitCollectionUpdated).toHaveBeenCalledTimes(expectedBatches);

    const batch1 = collections.slice(0, BATCH_SIZE);
    const batch2 = collections.slice(BATCH_SIZE, BATCH_SIZE * 2);
    const batch3 = collections.slice(BATCH_SIZE * 2);
    expect(emitCollectionUpdated).toHaveBeenNthCalledWith(1, batch1);
    expect(emitCollectionUpdated).toHaveBeenNthCalledWith(2, batch2);
    expect(emitCollectionUpdated).toHaveBeenNthCalledWith(3, batch3);
  });

  it('handles empty collections array without emitting', async () => {
    await processCollectionsInBatches([]);

    expect(emitCollectionUpdated).not.toHaveBeenCalled();
    expect(upsertCollections).not.toHaveBeenCalled();
  });
});
