import { describe, it, expect } from 'vitest';
import { getScope } from '@/lib/admins/getScope';
import { Catalog_Admins_t, InProcess_Admins_t } from '@/types/envio';

const makeInProcessAdmin = (
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

describe('getScope', () => {
  it('returns permission for InProcess_Admins_t', () => {
    expect(getScope(makeInProcessAdmin({ permission: 2 }))).toBe(2);
  });

  it('returns 0 for InProcess_Admins_t with permission 0', () => {
    expect(getScope(makeInProcessAdmin({ permission: 0 }))).toBe(0);
  });

  it('returns auth_scope for Catalog_Admins_t', () => {
    expect(getScope(makeCatalogAdmin({ auth_scope: 2 }))).toBe(2);
  });

  it('returns 0 for Catalog_Admins_t with auth_scope 0', () => {
    expect(getScope(makeCatalogAdmin({ auth_scope: 0 }))).toBe(0);
  });
});
