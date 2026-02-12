import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapCollectorsToSupabase } from '../mapCollectorsToSupabase';
import type { InProcess_Collectors_t } from '@/types/envio';

vi.mock('@/lib/moments/getMomentIdMap', () => ({
  getMomentIdMap: vi.fn(),
}));

import { getMomentIdMap } from '@/lib/moments/getMomentIdMap';

const mockGetMomentIdMap = vi.mocked(getMomentIdMap);

function makeCollector(
  overrides: Partial<InProcess_Collectors_t> = {}
): InProcess_Collectors_t {
  return {
    id: 'c1',
    collection: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    token_id: 1,
    amount: 5,
    chain_id: 8453,
    collector: '0xCollEcToR1234567890AbCdEf1234567890AbCd',
    transaction_hash:
      '0xABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    collected_at: 1700000000,
    ...overrides,
  };
}

describe('mapCollectorsToSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should normalize transaction_hash to lowercase', async () => {
    const collector = makeCollector();
    const tripletKey = `${collector.collection.toLowerCase()}:${collector.chain_id}:${collector.token_id}`;

    mockGetMomentIdMap.mockResolvedValue(
      new Map([[tripletKey, 'moment-uuid-1']])
    );

    const result = await mapCollectorsToSupabase([collector]);

    expect(result).toHaveLength(1);
    expect(result[0].transaction_hash).toBe(
      collector.transaction_hash.toLowerCase()
    );
    expect(result[0].transaction_hash).not.toMatch(/[A-F]/);
  });

  it('should normalize collector address to lowercase', async () => {
    const collector = makeCollector();
    const tripletKey = `${collector.collection.toLowerCase()}:${collector.chain_id}:${collector.token_id}`;

    mockGetMomentIdMap.mockResolvedValue(
      new Map([[tripletKey, 'moment-uuid-1']])
    );

    const result = await mapCollectorsToSupabase([collector]);

    expect(result[0].collector).toBe(collector.collector.toLowerCase());
    expect(result[0].collector).not.toMatch(/[A-Z]/);
  });

  it('should map moment ID from getMomentIdMap', async () => {
    const collector = makeCollector();
    const tripletKey = `${collector.collection.toLowerCase()}:${collector.chain_id}:${collector.token_id}`;

    mockGetMomentIdMap.mockResolvedValue(
      new Map([[tripletKey, 'moment-uuid-1']])
    );

    const result = await mapCollectorsToSupabase([collector]);

    expect(result[0].moment).toBe('moment-uuid-1');
  });

  it('should convert collected_at to ISO timestamp', async () => {
    const collector = makeCollector({ collected_at: 1700000000 });
    const tripletKey = `${collector.collection.toLowerCase()}:${collector.chain_id}:${collector.token_id}`;

    mockGetMomentIdMap.mockResolvedValue(
      new Map([[tripletKey, 'moment-uuid-1']])
    );

    const result = await mapCollectorsToSupabase([collector]);

    // toSupabaseTimestamp multiplies by 1000 and converts to ISO
    expect(result[0].collected_at).toBe(
      new Date(1700000000 * 1000).toISOString()
    );
  });

  it('should filter out collectors with no matching moment', async () => {
    const collector = makeCollector();

    mockGetMomentIdMap.mockResolvedValue(new Map()); // empty map = no match

    const result = await mapCollectorsToSupabase([collector]);

    expect(result).toHaveLength(0);
  });

  it('should handle an empty collectors array', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());

    const result = await mapCollectorsToSupabase([]);

    expect(result).toEqual([]);
  });

  it('should map multiple collectors and keep only matched ones', async () => {
    const c1 = makeCollector({
      id: 'c1',
      collection: '0xAAA',
      token_id: 1,
      chain_id: 8453,
    });
    const c2 = makeCollector({
      id: 'c2',
      collection: '0xBBB',
      token_id: 2,
      chain_id: 8453,
    });
    const c3 = makeCollector({
      id: 'c3',
      collection: '0xCCC',
      token_id: 3,
      chain_id: 8453,
    });

    mockGetMomentIdMap.mockResolvedValue(
      new Map([
        ['0xaaa:8453:1', 'moment-1'],
        // c2 has no match
        ['0xccc:8453:3', 'moment-3'],
      ])
    );

    const result = await mapCollectorsToSupabase([c1, c2, c3]);

    expect(result).toHaveLength(2);
    expect(result[0].moment).toBe('moment-1');
    expect(result[1].moment).toBe('moment-3');
  });

  it('should preserve the amount field as-is', async () => {
    const collector = makeCollector({ amount: 42 });
    const tripletKey = `${collector.collection.toLowerCase()}:${collector.chain_id}:${collector.token_id}`;

    mockGetMomentIdMap.mockResolvedValue(
      new Map([[tripletKey, 'moment-uuid-1']])
    );

    const result = await mapCollectorsToSupabase([collector]);

    expect(result[0].amount).toBe(42);
  });

  it('should handle transaction_hash that is already lowercase', async () => {
    const collector = makeCollector({
      transaction_hash: '0xabcdef1234567890abcdef1234567890',
    });
    const tripletKey = `${collector.collection.toLowerCase()}:${collector.chain_id}:${collector.token_id}`;

    mockGetMomentIdMap.mockResolvedValue(
      new Map([[tripletKey, 'moment-uuid-1']])
    );

    const result = await mapCollectorsToSupabase([collector]);

    expect(result[0].transaction_hash).toBe(
      '0xabcdef1234567890abcdef1234567890'
    );
  });
});
