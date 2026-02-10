import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emitAdminUpdated } from '@/lib/socket/emitAdminUpdated';
import { InProcess_Admins_t } from '@/types/envio';

const mockEmit = vi.fn();

vi.mock('@/lib/socket/server', () => ({
  getIO: vi.fn(),
}));

import { getIO } from '@/lib/socket/server';

const makeAdmin = (
  overrides: Partial<InProcess_Admins_t> = {}
): InProcess_Admins_t => ({
  id: '1',
  admin: '0xadmin',
  collection: '0x1234567890abcdef1234567890abcdef12345678',
  token_id: 1,
  chain_id: 8453,
  permission: 2,
  updated_at: 2000,
  ...overrides,
});

describe('emitAdminUpdated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when io is null', () => {
    vi.mocked(getIO).mockReturnValue(null);

    emitAdminUpdated([makeAdmin()]);

    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('emits moment:admin:updated with tokenId when token_id is truthy', () => {
    vi.mocked(getIO).mockReturnValue({ emit: mockEmit } as any);

    const admins = [
      makeAdmin({ collection: '0xaaa', token_id: 1, chain_id: 1 }),
      makeAdmin({ collection: '0xbbb', token_id: 2, chain_id: 8453 }),
    ];

    emitAdminUpdated(admins);

    expect(mockEmit).toHaveBeenCalledTimes(2);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'moment:admin:updated', {
      collectionAddress: '0xaaa',
      tokenId: 1,
      chainId: 1,
    });
    expect(mockEmit).toHaveBeenNthCalledWith(2, 'moment:admin:updated', {
      collectionAddress: '0xbbb',
      tokenId: 2,
      chainId: 8453,
    });
  });

  it('emits collection:admin:updated without tokenId when token_id is 0', () => {
    vi.mocked(getIO).mockReturnValue({ emit: mockEmit } as any);

    emitAdminUpdated([
      makeAdmin({ collection: '0xccc', token_id: 0, chain_id: 1 }),
    ]);

    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith('collection:admin:updated', {
      collectionAddress: '0xccc',
      chainId: 1,
    });
  });

  it('emits nothing for an empty array', () => {
    vi.mocked(getIO).mockReturnValue({ emit: mockEmit } as any);

    emitAdminUpdated([]);

    expect(mockEmit).not.toHaveBeenCalled();
  });
});
