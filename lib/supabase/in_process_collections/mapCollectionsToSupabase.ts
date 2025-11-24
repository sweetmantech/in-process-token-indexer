import { Database } from '@/legacy/lib/supabase/types';
import toSupabaseTimestamp from '@/lib/utils/toSupabaseTimestamp';
import { InProcess_Collections_t } from '@/types/envio';

/**
 * Maps Envio InProcess_Collections_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Ensures correct null handling for optional fields.
 * - Serializes all values to primitive types for Supabase.
 *
 * @param collections - Array of InProcess_Collections_t from Envio.
 * @returns Array of objects formatted for Supabase upsert.
 */
export function mapCollectionsToSupabase(
  collections: InProcess_Collections_t[]
): Array<Database['public']['Tables']['in_process_collections']['Insert']> {
  return collections.map(c => ({
    address: c.address,
    uri: c.uri,
    default_admin: c.default_admin,
    payout_recipient: c.payout_recipient,
    chain_id: c.chain_id,
    created_at: toSupabaseTimestamp(c.created_at),
    updated_at: toSupabaseTimestamp(c.updated_at),
  }));
}
