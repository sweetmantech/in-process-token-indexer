import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';

/**
 * Upserts admins into Supabase.
 * @param admins - Array of admin objects to upsert.
 * @returns Array of upserted admin rows.
 */
export async function upsertAdmins(
  admins: Array<Database['public']['Tables']['in_process_admins']['Insert']>
): Promise<Array<Database['public']['Tables']['in_process_admins']['Row']>> {
  if (admins.length === 0) {
    console.log('ℹ️  No admins to upsert');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('in_process_admins')
      .upsert(admins, {
        onConflict: 'collection,artist_address,token_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Upserted ${data?.length || 0} admin(s)`);
    return data || [];
  } catch (error) {
    console.error(`❌ Failed to upsert admins:`, error);
    throw error;
  }
}
