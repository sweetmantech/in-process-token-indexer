import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emitCollectionUpdated } from '@/lib/socket/emitCollectionUpdated';
import { InProcess_Collections_t } from '@/types/envio';

const mockEmit = vi.fn();

vi.mock('@/lib/socket/server', () => ({
  getIO: vi.fn(),
}));

import { getIO } from '@/lib/socket/server';

const makeCollection = (
  overrides: Partial<InProcess_Collections_t> = {}
): InProcess_Collections_t => ({
  id: '1',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  chain_id: 8453,
  created_at: 1000,
  default_admin: '0xadmin',
  name: 'Collection 1',
  payout_recipient: '0xpayout',
  transaction_hash: '0xabc',
  updated_at: 2000,
  uri: 'ar://abc',
  ...overrides,
});

describe('emitCollectionUpdated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when io is null', () => {
    vi.mocked(getIO).mockReturnValue(null);

    emitCollectionUpdated([makeCollection()]);

    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('emits collection:updated for each collection', () => {
    vi.mocked(getIO).mockReturnValue({ emit: mockEmit } as any);

    const collections = [
      makeCollection({ address: '0xaaa', chain_id: 1 }),
      makeCollection({ address: '0xbbb', chain_id: 8453 }),
    ];

    emitCollectionUpdated(collections);

    expect(mockEmit).toHaveBeenCalledTimes(2);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'collection:updated', {
      collectionAddress: '0xaaa',
      chainId: 1,
    });
    expect(mockEmit).toHaveBeenNthCalledWith(2, 'collection:updated', {
      collectionAddress: '0xbbb',
      chainId: 8453,
    });
  });

  it('emits nothing for an empty array', () => {
    vi.mocked(getIO).mockReturnValue({ emit: mockEmit } as any);

    emitCollectionUpdated([]);

    expect(mockEmit).not.toHaveBeenCalled();
  });
});
