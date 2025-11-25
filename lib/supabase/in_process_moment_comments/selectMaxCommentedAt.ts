import { supabase } from '../client';

/**
 * Gets the maximum commented_at timestamp from in_process_moment_comments table.
 * Used for incremental indexing to only fetch records commented after this timestamp.
 * @returns Maximum commented_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxCommentedAt(): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('in_process_moment_comments')
      .select('commented_at')
      .order('commented_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // PGRST116 means no rows found, which is fine for initial sync
      if (error.code === 'PGRST116') {
        console.log(
          'ℹ️  No moment comments found in Supabase, starting from beginning'
        );
        return null;
      }
      throw error;
    }

    if (!data || !data.commented_at) {
      return null;
    }

    // Convert ISO timestamp to milliseconds
    const maxCommentedAt = new Date(data.commented_at).getTime();
    return maxCommentedAt;
  } catch (error) {
    console.error('❌ Error selecting max commented_at:', error);
    throw error;
  }
}
