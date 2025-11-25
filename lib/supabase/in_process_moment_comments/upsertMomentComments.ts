import { supabase } from '../client';
import type { Database } from '../types';

/**
 * Upserts moment comments into Supabase.
 * @param momentComments - Array of moment comment objects to upsert.
 * @returns Array of upserted moment comment rows.
 */
export async function upsertMomentComments(
  momentComments: Array<
    Database['public']['Tables']['in_process_moment_comments']['Insert']
  >
): Promise<
  Array<Database['public']['Tables']['in_process_moment_comments']['Row']>
> {
  if (momentComments.length === 0) {
    console.log('ℹ️  No moment comments to upsert');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('in_process_moment_comments')
      .upsert(momentComments, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Upserted ${data?.length || 0} moment comment(s)`);
    return data || [];
  } catch (error) {
    console.error(`❌ Failed to upsert moment comments:`, error);
    throw error;
  }
}
