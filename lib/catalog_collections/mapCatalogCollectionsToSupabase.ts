import toSupabaseTimestamp from '@/lib/toSupabaseTimestamp';
import { Catalog_Collections_t } from '@/types/envio';
import { Database } from '@/lib/supabase/types';

export function mapCatalogCollectionsToSupabase(
  collections: Catalog_Collections_t[]
): Array<Database['public']['Tables']['in_process_collections']['Insert']> {
  return collections.map(c => ({
    address: c.address,
    name: c.name,
    uri: c.uri,
    default_admin: c.creator,
    payout_recipient: "",
    chain_id: c.chain_id,
    created_at: toSupabaseTimestamp(c.created_at),
    updated_at: toSupabaseTimestamp(c.updated_at),
  }));
}
