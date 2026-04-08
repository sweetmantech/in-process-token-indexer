import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InProcess_Moments_t } from '@/types/envio';

vi.mock('@/lib/consts', () => ({
  BATCH_SIZE: 3,
}));

const BATCH_SIZE = 3;
vi.mock('@/lib/moments/mapMomentsToSupabase', () => ({
  mapMomentsToSupabase: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_moments/upsertMoments', () => ({
  upsertMoments: vi.fn(),
}));
vi.mock('@/lib/moments/mapMetadataToSupabase', () => ({
  mapMetadataToSupabase: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_metadata/upsertMetadata', () => ({
  upsertMetadata: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/upsertArtistNames', () => ({
  upsertArtistNames: vi.fn(),
}));
vi.mock('@/lib/socket/emitMomentUpdated', () => ({
  emitMomentUpdated: vi.fn(),
}));
vi.mock('@/lib/socket/emitMomentsCountUpdated', () => ({
  emitMomentsCountUpdated: vi.fn(),
}));

import { processMomentsInBatches } from '@/lib/moments/processMomentsInBatches';
import { mapMomentsToSupabase } from '@/lib/moments/mapMomentsToSupabase';
import { upsertMoments } from '@/lib/supabase/in_process_moments/upsertMoments';
import { mapMetadataToSupabase } from '@/lib/moments/mapMetadataToSupabase';
import { upsertArtistNames } from '@/lib/supabase/in_process_artists/upsertArtistNames';
import { emitMomentUpdated } from '@/lib/socket/emitMomentUpdated';
import { emitMomentsCountUpdated } from '@/lib/socket/emitMomentsCountUpdated';

const makeMoment = (id: string): InProcess_Moments_t => ({
  id,
  collection: `0x${id}`,
  token_id: id,
  uri: `ar://${id}`,
  max_supply: '100',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: `0xhash${id}`,
});

const emptyMetadataResult = () =>
  Promise.resolve({ records: [], artistNamesByAddresses: new Map() });

describe('processMomentsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapMomentsToSupabase).mockResolvedValue([]);
    vi.mocked(upsertMoments).mockResolvedValue([] as any);
    vi.mocked(mapMetadataToSupabase).mockImplementation(emptyMetadataResult);
    vi.mocked(upsertArtistNames).mockResolvedValue(undefined);
  });

  it('handles empty moments array without emitting', async () => {
    await processMomentsInBatches([]);

    expect(emitMomentUpdated).not.toHaveBeenCalled();
    expect(upsertMoments).not.toHaveBeenCalled();
    expect(emitMomentsCountUpdated).not.toHaveBeenCalled();
  });

  it('calls emitMomentUpdated after upsertMoments with the original batch', async () => {
    const moments = [makeMoment('1')];
    vi.mocked(mapMomentsToSupabase).mockResolvedValue([
      { mapped: true },
    ] as any);

    await processMomentsInBatches(moments);

    expect(upsertMoments).toHaveBeenCalledBefore(vi.mocked(emitMomentUpdated));
    expect(emitMomentUpdated).toHaveBeenCalledWith(moments);
  });

  it('calls upsertArtistNames with artistNamesByAddresses from mapMetadataToSupabase', async () => {
    const moments = [makeMoment('1')];
    vi.mocked(mapMomentsToSupabase).mockResolvedValue([
      { mapped: true },
    ] as any);
    const artistMap = new Map([['0xabc', 'Artist Name']]);
    vi.mocked(mapMetadataToSupabase).mockResolvedValue({
      records: [],
      artistNamesByAddresses: artistMap,
    });

    await processMomentsInBatches(moments);

    expect(upsertArtistNames).toHaveBeenCalledWith(artistMap);
  });

  it('calls emitMomentsCountUpdated once after all batches when moments are processed', async () => {
    const moments = [makeMoment('1')];
    vi.mocked(mapMomentsToSupabase).mockResolvedValue([
      { mapped: true },
    ] as any);

    await processMomentsInBatches(moments);

    expect(emitMomentsCountUpdated).toHaveBeenCalledTimes(1);
  });

  it('does not emit when upsert throws', async () => {
    const moments = [makeMoment('1')];
    vi.mocked(mapMomentsToSupabase).mockResolvedValue([
      { mapped: true },
    ] as any);
    vi.mocked(upsertMoments).mockRejectedValue(new Error('db error'));

    await processMomentsInBatches(moments);

    expect(emitMomentUpdated).not.toHaveBeenCalled();
    expect(emitMomentsCountUpdated).not.toHaveBeenCalled();
  });

  it('emits for each batch separately when moments exceed BATCH_SIZE', async () => {
    const totalMoments = BATCH_SIZE * 2 + 1;
    const moments = Array.from({ length: totalMoments }, (_, i) =>
      makeMoment(String(i))
    );
    vi.mocked(mapMomentsToSupabase).mockResolvedValue([
      { mapped: true },
    ] as any);

    await processMomentsInBatches(moments);

    const expectedBatches = Math.ceil(totalMoments / BATCH_SIZE);
    expect(emitMomentUpdated).toHaveBeenCalledTimes(expectedBatches);

    expect(emitMomentUpdated).toHaveBeenNthCalledWith(
      1,
      moments.slice(0, BATCH_SIZE)
    );
    expect(emitMomentUpdated).toHaveBeenNthCalledWith(
      2,
      moments.slice(BATCH_SIZE, BATCH_SIZE * 2)
    );
    expect(emitMomentUpdated).toHaveBeenNthCalledWith(
      3,
      moments.slice(BATCH_SIZE * 2)
    );
  });
});
