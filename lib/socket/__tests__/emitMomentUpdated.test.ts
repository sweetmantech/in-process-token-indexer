import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emitMomentUpdated } from '@/lib/socket/emitMomentUpdated';
import { InProcess_Moments_t } from '@/types/envio';

const mockEmit = vi.fn();

vi.mock('@/lib/socket/server', () => ({
  getIO: vi.fn(),
}));

import { getIO } from '@/lib/socket/server';

const makeMoment = (
  overrides: Partial<InProcess_Moments_t> = {}
): InProcess_Moments_t => ({
  id: '1',
  collection: '0x1234567890abcdef1234567890abcdef12345678',
  token_id: 1,
  uri: 'ar://abc',
  max_supply: '100',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xabc',
  ...overrides,
});

describe('emitMomentUpdated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when io is null', () => {
    vi.mocked(getIO).mockReturnValue(null);

    emitMomentUpdated([makeMoment()]);

    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('emits moment:updated for each moment', () => {
    vi.mocked(getIO).mockReturnValue({ emit: mockEmit } as any);

    const moments = [
      makeMoment({ collection: '0xaaa', token_id: 1, chain_id: 1 }),
      makeMoment({ collection: '0xbbb', token_id: 2, chain_id: 8453 }),
    ];

    emitMomentUpdated(moments);

    expect(mockEmit).toHaveBeenCalledTimes(2);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'moment:updated', {
      collectionAddress: '0xaaa',
      tokenId: 1,
      chainId: 1,
    });
    expect(mockEmit).toHaveBeenNthCalledWith(2, 'moment:updated', {
      collectionAddress: '0xbbb',
      tokenId: 2,
      chainId: 8453,
    });
  });

  it('emits nothing for an empty array', () => {
    vi.mocked(getIO).mockReturnValue({ emit: mockEmit } as any);

    emitMomentUpdated([]);

    expect(mockEmit).not.toHaveBeenCalled();
  });
});
