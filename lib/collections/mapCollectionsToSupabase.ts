import toSupabaseTimestamp from '@/lib/toSupabaseTimestamp';
import { Catalog_Collections_t, InProcess_Collections_t } from '@/types/envio';
import { Database } from '@/lib/supabase/types';

/**
 * Maps Envio InProcess_Collections_t | Catalog_Collections_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Serializes all values to primitive types for Supabase.
 * - All required fields are present (validated upstream).
 *
 * @param collections - Array of InProcess_Collections_t from Envio.
 * @returns Array of objects formatted for Supabase upsert.
 */
export function mapCollectionsToSupabase(
  collections: InProcess_Collections_t[] | Catalog_Collections_t[]
): Array<Database['public']['Tables']['in_process_collections']['Insert']> {
  return collections.map(c => ({
    address: c.address,
    name: c.name,
    uri: c.uri,
    creator: 'creator' in c ? c.creator : c.default_admin,
    chain_id: c.chain_id,
    created_at: toSupabaseTimestamp(c.created_at),
    updated_at: toSupabaseTimestamp(c.updated_at),
    protocol: 'creator' in c ? 'catalog' : 'in_process',
  }));
}
