import { supabase } from '../client';
import type { Database } from '../types';

/**
 * Upserts moment admins into Supabase.
 * @param momentAdmins - Array of moment admin objects to upsert.
 * @returns Array of upserted moment admin rows.
 */
export async function upsertMomentAdmins(
  momentAdmins: Array<
    Database['public']['Tables']['in_process_moment_admins']['Insert']
  >
): Promise<
  Array<Database['public']['Tables']['in_process_moment_admins']['Row']>
> {
  if (momentAdmins.length === 0) {
    console.log('ℹ️  No moment admins to upsert');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('in_process_moment_admins')
      .upsert(momentAdmins, {
        onConflict: 'moment,artist_address',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Upserted ${data?.length || 0} moment admin(s)`);
    return data || [];
  } catch (error) {
    console.error(`❌ Failed to upsert moment admins:`, error);
    throw error;
  }
}
