import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

/**
 * Upserts moment comments into Supabase.
 * @param comments - Array of comment objects to upsert.
 * @returns Array of upserted moment comment rows.
 */
export async function upsertComments(
  comments: Array<
    Database['public']['Tables']['in_process_moment_comments']['Insert']
  >
): Promise<
  Array<Database['public']['Tables']['in_process_moment_comments']['Row']>
> {
  if (comments.length === 0) {
    console.log('ℹ️  No moment comments to upsert');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('in_process_moment_comments')
      .upsert(comments, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Upserted ${data?.length || 0} comment(s)`);
    return data || [];
  } catch (error) {
    console.error(`❌ Failed to upsert comments:`, error);
    throw error;
  }
}
