import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

/**
 * Upserts collection admins into Supabase.
 * @param collectionAdmins - Array of collection admin objects to upsert.
 * @returns Array of upserted collection admin rows.
 */
export async function upsertCollectionAdmins(
  collectionAdmins: Array<
    Database['public']['Tables']['in_process_collection_admins']['Insert']
  >
): Promise<
  Array<Database['public']['Tables']['in_process_collection_admins']['Row']>
> {
  if (collectionAdmins.length === 0) {
    console.log('ℹ️  No collection admins to upsert');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('in_process_collection_admins')
      .upsert(collectionAdmins, {
        onConflict: 'collection,artist_address',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Upserted ${data?.length || 0} collection admin(s)`);
    return data || [];
  } catch (error) {
    console.error(`❌ Failed to upsert collection admins:`, error);
    throw error;
  }
}
