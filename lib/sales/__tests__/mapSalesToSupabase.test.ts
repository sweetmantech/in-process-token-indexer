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

  it('uses token_id as-is for moment lookup', async () => {
    const sale = makeSale({ token_id: '3' });
    const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:3`;
    mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-uuid-1']]));

    const result = await mapSalesToSupabase([sale]);

    expect(result.sales).toHaveLength(1);
    expect(result.sales[0].moment).toBe('moment-uuid-1');
  });

  it('passes entities with original token_id to getMomentIdMap', async () => {
    const sale = makeSale({ token_id: '5' });
    const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:5`;
    mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-uuid-1']]));

    await mapSalesToSupabase([sale]);

    const passedEntities = mockGetMomentIdMap.mock
      .calls[0][0] as Primary_Sales_t[];
    expect(passedEntities[0].token_id).toBe('5');
  });

  describe('field mapping', () => {
    it('maps all sale fields correctly', async () => {
      const sale = makeSale({
        token_id: '2',
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
        created_at: new Date(1700000000 * 1000).toISOString(),
      });
    });

    it('normalizes funds_recipient to lowercase', async () => {
      const sale = makeSale({
        token_id: '1',
        funds_recipient: '0xABCDEF',
      });
      const key = `${sale.collection.toLowerCase()}:${sale.chain_id}:1`;
      mockGetMomentIdMap.mockResolvedValue(new Map([[key, 'moment-uuid-1']]));

      const result = await mapSalesToSupabase([sale]);

      expect(result.sales[0].funds_recipient).toBe('0xabcdef');
    });

    it('defaults null sale_start/sale_end/max_tokens_per_address to 0', async () => {
      const sale = makeSale({
        token_id: '1',
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
});
