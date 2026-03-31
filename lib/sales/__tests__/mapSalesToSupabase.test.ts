import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapSalesToSupabase } from '../mapSalesToSupabase';
import type { Primary_Sales_t } from '@/types/envio';

vi.mock('@/lib/moments/getMomentIdMap', () => ({
  getMomentIdMap: vi.fn(),
}));
vi.mock('@/lib/sales/getFeeRecipientsForSale', () => ({
  getFeeRecipientsForSale: vi.fn(),
}));

import { getMomentIdMap } from '@/lib/moments/getMomentIdMap';
import { getFeeRecipientsForSale } from '@/lib/sales/getFeeRecipientsForSale';

const mockGetMomentIdMap = vi.mocked(getMomentIdMap);
const mockGetFeeRecipients = vi.mocked(getFeeRecipientsForSale);

function makeSale(overrides: Partial<Primary_Sales_t> = {}): Primary_Sales_t {
  return {
    id: 'sale-1',
    collection: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    token_id: '1',
    sale_start: '1700000000',
    sale_end: '1800000000',
    max_tokens_per_address: '10',
    price_per_token: '1000000',
    funds_recipient: '0xFundsRecipient1234567890AbCdEf1234567890',
    currency: '0x0000000000000000000000000000000000000000',
    schedule_num: null,
    chain_id: 8453,
    transaction_hash:
      '0xABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890',
    created_at: 1700000000,
    ...overrides,
  };
}

describe('mapSalesToSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFeeRecipients.mockResolvedValue([]);
  });

  it('returns empty results for empty input', async () => {
    mockGetMomentIdMap.mockResolvedValue(new Map());

    const result = await mapSalesToSupabase([]);

    expect(result.sales).toHaveLength(0);
    expect(result.feeRecipients).toHaveLength(0);
  });

  it('filters out sales with no matching moment', async () => {
    const sale = makeSale();
    mockGetMomentIdMap.mockResolvedValue(new Map());

    const result = await mapSalesToSupabase([sale]);

    expect(result.sales).toHaveLength(0);
  });

  describe('InProcess/Catalog sales (schedule_num=null)', () => {
    it('uses token_id as-is for moment lookup', async () => {
      const sale = makeSale({ token_id: '3', schedule_num: null });
      const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:3`;
      mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-uuid-1']]));

      const result = await mapSalesToSupabase([sale]);

      expect(result.sales).toHaveLength(1);
      expect(result.sales[0].moment).toBe('moment-uuid-1');
    });

    it('passes entities with original token_id to getMomentIdMap', async () => {
      const sale = makeSale({ token_id: '5', schedule_num: null });
      const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:5`;
      mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-uuid-1']]));

      await mapSalesToSupabase([sale]);

      const passedEntities = mockGetMomentIdMap.mock
        .calls[0][0] as Primary_Sales_t[];
      expect(passedEntities[0].token_id).toBe('5');
    });
  });

  describe('Sound.xyz sales (schedule_num non-null)', () => {
    it('uses token_id+1 for moment lookup when schedule_num is 0', async () => {
      const sale = makeSale({ token_id: '0', schedule_num: 0 });
      const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:1`;
      mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-sound-1']]));

      const result = await mapSalesToSupabase([sale]);

      expect(result.sales).toHaveLength(1);
      expect(result.sales[0].moment).toBe('moment-sound-1');
    });

    it('uses token_id+1 for moment lookup when tier=1 (schedule_num=0)', async () => {
      const sale = makeSale({ token_id: '1', schedule_num: 0 });
      const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:2`;
      mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-sound-2']]));

      const result = await mapSalesToSupabase([sale]);

      expect(result.sales).toHaveLength(1);
      expect(result.sales[0].moment).toBe('moment-sound-2');
    });

    it('passes adjusted token_id (tier+1) to getMomentIdMap', async () => {
      const sale = makeSale({ token_id: '0', schedule_num: 1 });
      const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:1`;
      mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-uuid']]));

      await mapSalesToSupabase([sale]);

      const passedEntities = mockGetMomentIdMap.mock
        .calls[0][0] as Primary_Sales_t[];
      expect(passedEntities[0].token_id).toBe('1');
    });

    it('does not match if moment lookup uses raw tier (without +1 offset)', async () => {
      const sale = makeSale({ token_id: '0', schedule_num: 0 });
      // Simulate the case where the key with raw token_id=0 is in the map
      // but the correct key token_id=1 is NOT — should return no result
      const wrongKey = `${sale.collection.toLowerCase()}:${sale.chain_id}:0`;
      mockGetMomentIdMap.mockResolvedValue(
        new Map([[wrongKey, 'wrong-moment']])
      );

      const result = await mapSalesToSupabase([sale]);

      expect(result.sales).toHaveLength(0);
    });
  });

  describe('field mapping', () => {
    it('maps all sale fields correctly', async () => {
      const sale = makeSale({
        token_id: '2',
        schedule_num: null,
        currency: '0xusdcaddress',
        funds_recipient: '0xRecipient',
        max_tokens_per_address: '5',
        price_per_token: '2000000',
        sale_start: '1700000000',
        sale_end: '1900000000',
        created_at: 1700000000,
      });
      const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:2`;
      mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-uuid-1']]));

      const result = await mapSalesToSupabase([sale]);

      expect(result.sales[0]).toMatchObject({
        moment: 'moment-uuid-1',
        currency: '0xusdcaddress',
        funds_recipient: '0xrecipient',
        max_tokens_per_address: 5,
        price_per_token: 2000000,
        sale_start: 1700000000,
        sale_end: 1900000000,
        schedule_num: null,
        created_at: new Date(1700000000 * 1000).toISOString(),
      });
    });

    it('normalizes funds_recipient to lowercase', async () => {
      const sale = makeSale({
        token_id: '1',
        schedule_num: null,
        funds_recipient: '0xABCDEF',
      });
      const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:1`;
      mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-uuid-1']]));

      const result = await mapSalesToSupabase([sale]);

      expect(result.sales[0].funds_recipient).toBe('0xabcdef');
    });

    it('stores schedule_num as null for InProcess/Catalog sales', async () => {
      const sale = makeSale({ token_id: '1', schedule_num: null });
      const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:1`;
      mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-uuid-1']]));

      const result = await mapSalesToSupabase([sale]);

      expect(result.sales[0].schedule_num).toBeNull();
    });

    it('stores schedule_num value for Sound.xyz sales', async () => {
      const sale = makeSale({ token_id: '0', schedule_num: 3 });
      const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:1`;
      mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-uuid-1']]));

      const result = await mapSalesToSupabase([sale]);

      expect(result.sales[0].schedule_num).toBe(3);
    });

    it('defaults null sale_start/sale_end/max_tokens_per_address to 0', async () => {
      const sale = makeSale({
        token_id: '1',
        schedule_num: null,
        sale_start: null,
        sale_end: null,
        max_tokens_per_address: null,
      });
      const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:1`;
      mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-uuid-1']]));

      const result = await mapSalesToSupabase([sale]);

      expect(result.sales[0].sale_start).toBe(0);
      expect(result.sales[0].sale_end).toBe(0);
      expect(result.sales[0].max_tokens_per_address).toBe(0);
    });
  });

  describe('mixed InProcess and Sound sales', () => {
    it('correctly resolves moments for both protocols in the same batch', async () => {
      const inProcessSale = makeSale({
        id: 'inprocess-1',
        collection: '0xInProcess',
        token_id: '3',
        schedule_num: null,
        chain_id: 8453,
      });
      const soundSale = makeSale({
        id: 'sound-1',
        collection: '0xSound',
        token_id: '0', // tier=0 → moment token_id=1
        schedule_num: 0,
        chain_id: 8453,
      });

      mockGetMomentIdMap.mockResolvedValue(
        new Map([
          ['0xinprocess:8453:3', 'moment-inprocess'],
          ['0xsound:8453:1', 'moment-sound'],
        ])
      );

      const result = await mapSalesToSupabase([inProcessSale, soundSale]);

      expect(result.sales).toHaveLength(2);
      expect(result.sales[0].moment).toBe('moment-inprocess');
      expect(result.sales[1].moment).toBe('moment-sound');
    });
  });
});
