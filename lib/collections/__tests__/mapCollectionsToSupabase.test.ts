import { describe, it, expect } from 'vitest';
import { mapCollectionsToSupabase } from '@/lib/collections/mapCollectionsToSupabase';
import type {
  Catalog_Collections_t,
  InProcess_Collections_t,
  Sound_Editions_t,
} from '@/types/envio';

const inProcessCollection: InProcess_Collections_t = {
  id: '1',
  address: '0xabc',
  name: 'Test',
  uri: 'ar://test',
  default_admin: '0xadmin',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xhash',
};

const catalogCollection: Catalog_Collections_t = {
  id: '2',
  address: '0xdef',
  name: 'Catalog',
  uri: 'ar://catalog',
  creator: '0xcreator',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xhash',
};

const soundEdition: Sound_Editions_t = {
  id: '3',
  address: '0xsound',
  name: 'Sound Edition',
  uri: 'ar://sound',
  owner: '0xowner',
  chain_id: 8453,
  created_at: 1000,
  updated_at: 2000,
  transaction_hash: '0xhash',
};

describe('mapCollectionsToSupabase', () => {
  it('maps InProcess_Collections_t with protocol in_process and default_admin as creator', () => {
    const result = mapCollectionsToSupabase([inProcessCollection]);

    expect(result).toHaveLength(1);
    expect(result[0].protocol).toBe('in_process');
    expect(result[0].creator).toBe('0xadmin');
    expect(result[0].address).toBe('0xabc');
  });

  it('maps Catalog_Collections_t with protocol catalog and creator field', () => {
    const result = mapCollectionsToSupabase([catalogCollection]);

    expect(result).toHaveLength(1);
    expect(result[0].protocol).toBe('catalog');
    expect(result[0].creator).toBe('0xcreator');
    expect(result[0].address).toBe('0xdef');
  });

  it('maps Sound_Editions_t with protocol sound.xyz and owner as creator', () => {
    const result = mapCollectionsToSupabase([soundEdition]);

    expect(result).toHaveLength(1);
    expect(result[0].protocol).toBe('sound.xyz');
    expect(result[0].creator).toBe('0xowner');
    expect(result[0].address).toBe('0xsound');
  });

  it('converts chain timestamps to ISO strings', () => {
    const result = mapCollectionsToSupabase([soundEdition]);

    expect(result[0].created_at).toBe(new Date(1000 * 1000).toISOString());
    expect(result[0].updated_at).toBe(new Date(2000 * 1000).toISOString());
  });
});
