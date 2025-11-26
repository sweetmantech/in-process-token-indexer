import { Database } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase/client';

/**
 * Upserts multiple collection records into the in_process_collections table.
 * - Uses address and chain_id as conflict resolution columns.
 * - Returns the upserted records.
 *
 * @param collections - Array of collection data objects to upsert (already mapped to Supabase format).
 * @returns The upserted records or throws error.
 */
export async function upsertCollections(
  collections: Array<
    Database['public']['Tables']['in_process_collections']['Insert']
  >
): Promise<
  Array<Database['public']['Tables']['in_process_collections']['Row']>
> {
  if (!collections.length) {
    console.log('ℹ️ No collections to upsert');
    return [];
  }

  const { data, error } = await supabase
    .from('in_process_collections')
    .upsert(collections, { onConflict: 'address, chain_id' })
    .select();

  if (error) {
    console.error(`❌ upsertCollections error:`, error);
    throw error;
  }

  console.log(
    `✅ upsertCollections: Upserted ${data?.length || 0} collections`
  );
  return data || [];
}
