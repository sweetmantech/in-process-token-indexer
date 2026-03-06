import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Catalog_Admins_t, InProcess_Admins_t } from '@/types/envio';

vi.mock('@/lib/consts', () => ({
  BATCH_SIZE: 3,
}));

const BATCH_SIZE = 3;
vi.mock('@/lib/admins/mapAdminsToSupabase', () => ({
  mapAdminsToSupabase: vi.fn(),
}));
vi.mock('@/lib/admins/mapAdminsForDeletion', () => ({
  mapAdminsForDeletion: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_admins/upsertAdmins', () => ({
  upsertAdmins: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_admins/deleteAdmins', () => ({
  deleteAdmins: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));
vi.mock('@/lib/socket/emitAdminUpdated', () => ({
  emitAdminUpdated: vi.fn(),
}));

import { processAdminsInBatches } from '@/lib/admins/processAdminsInBatches';
import { mapAdminsToSupabase } from '@/lib/admins/mapAdminsToSupabase';
import { mapAdminsForDeletion } from '@/lib/admins/mapAdminsForDeletion';
import { upsertAdmins } from '@/lib/supabase/in_process_admins/upsertAdmins';
import { deleteAdmins } from '@/lib/supabase/in_process_admins/deleteAdmins';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';
import { emitAdminUpdated } from '@/lib/socket/emitAdminUpdated';

const makeAdmin = (
  overrides: Partial<InProcess_Admins_t> = {}
): InProcess_Admins_t => ({
  id: '1',
  admin: '0xadmin',
  collection: '0xaaa',
  token_id: '1',
  chain_id: 8453,
  permission: 2,
  updated_at: 2000,
  ...overrides,
});

describe('processAdminsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapAdminsToSupabase).mockResolvedValue([
      { artist_address: '0xadmin' },
    ] as any);
    vi.mocked(mapAdminsForDeletion).mockResolvedValue([]);
    vi.mocked(ensureArtists).mockResolvedValue(undefined);
    vi.mocked(upsertAdmins).mockResolvedValue([] as any);
    vi.mocked(deleteAdmins).mockResolvedValue(0);
  });

  it('calls emitAdminUpdated after processing the batch', async () => {
    const admins = [makeAdmin({ permission: 2 })];

    await processAdminsInBatches(admins);

    expect(emitAdminUpdated).toHaveBeenCalledWith(admins);
  });

  it('does not emit when batch throws', async () => {
    const admins = [makeAdmin({ permission: 2 })];
    vi.mocked(upsertAdmins).mockRejectedValue(new Error('db error'));

    await processAdminsInBatches(admins);

    expect(emitAdminUpdated).not.toHaveBeenCalled();
  });

  it('emits for each batch separately when admins exceed BATCH_SIZE', async () => {
    const totalAdmins = BATCH_SIZE * 2 + 1;
    const admins = Array.from({ length: totalAdmins }, (_, i) =>
      makeAdmin({ id: String(i), permission: 2 })
    );

    await processAdminsInBatches(admins);

    const expectedBatches = Math.ceil(totalAdmins / BATCH_SIZE);
    expect(emitAdminUpdated).toHaveBeenCalledTimes(expectedBatches);

    const batch1 = admins.slice(0, BATCH_SIZE);
    const batch2 = admins.slice(BATCH_SIZE, BATCH_SIZE * 2);
    const batch3 = admins.slice(BATCH_SIZE * 2);
    expect(emitAdminUpdated).toHaveBeenNthCalledWith(1, batch1);
    expect(emitAdminUpdated).toHaveBeenNthCalledWith(2, batch2);
    expect(emitAdminUpdated).toHaveBeenNthCalledWith(3, batch3);
  });

  it('handles empty admins array without emitting', async () => {
    await processAdminsInBatches([]);

    expect(emitAdminUpdated).not.toHaveBeenCalled();
    expect(upsertAdmins).not.toHaveBeenCalled();
    expect(deleteAdmins).not.toHaveBeenCalled();
  });
});

const makeCatalogAdmin = (
  overrides: Partial<Catalog_Admins_t> = {}
): Catalog_Admins_t => ({
  id: '1',
  admin: '0xadmin',
  collection: '0xaaa',
  token_id: '1',
  chain_id: 8453,
  auth_scope: 2,
  updated_at: 2000,
  ...overrides,
});

describe('processAdminsInBatches (Catalog_Admins_t)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapAdminsToSupabase).mockResolvedValue([
      { artist_address: '0xadmin' },
    ] as any);
    vi.mocked(mapAdminsForDeletion).mockResolvedValue([]);
    vi.mocked(ensureArtists).mockResolvedValue(undefined);
    vi.mocked(upsertAdmins).mockResolvedValue([] as any);
    vi.mocked(deleteAdmins).mockResolvedValue(0);
  });

  it('upserts when auth_scope is non-zero', async () => {
    const admins = [makeCatalogAdmin({ auth_scope: 2 })];

    await processAdminsInBatches(admins);

    expect(mapAdminsToSupabase).toHaveBeenCalledWith(admins);
    expect(upsertAdmins).toHaveBeenCalled();
    expect(deleteAdmins).not.toHaveBeenCalled();
  });

  it('deletes when auth_scope is 0', async () => {
    const admins = [makeCatalogAdmin({ auth_scope: 0 })];

    await processAdminsInBatches(admins);

    expect(mapAdminsForDeletion).toHaveBeenCalledWith(admins);
    expect(deleteAdmins).toHaveBeenCalled();
    expect(upsertAdmins).not.toHaveBeenCalled();
  });

  it('splits delete and upsert within same batch', async () => {
    const admins = [
      makeCatalogAdmin({ id: '1', auth_scope: 0 }),
      makeCatalogAdmin({ id: '2', auth_scope: 2 }),
    ];

    await processAdminsInBatches(admins);

    expect(mapAdminsForDeletion).toHaveBeenCalledWith([admins[0]]);
    expect(mapAdminsToSupabase).toHaveBeenCalledWith([admins[1]]);
  });

  it('calls emitAdminUpdated after processing', async () => {
    const admins = [makeCatalogAdmin({ auth_scope: 2 })];

    await processAdminsInBatches(admins);

    expect(emitAdminUpdated).toHaveBeenCalledWith(admins);
  });
});
