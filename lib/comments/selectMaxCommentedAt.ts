import { selectComments } from '@/lib/supabase/in_process_moment_comments/selectComments';

/**
 * Gets the maximum commented_at timestamp from in_process_moment_comments table.
 * Used for incremental indexing to only fetch records commented after this timestamp.
 * @returns Maximum commented_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxCommentedAt(): Promise<number | null> {
  try {
    const data = await selectComments({
      order: { column: 'commented_at', ascending: false },
      limit: 1,
    });

    if (!data || data.length === 0 || !data[0]?.commented_at) {
      return null;
    }

    // Convert ISO string to milliseconds timestamp
    return new Date(data[0].commented_at).getTime();
  } catch (error) {
    console.error('❌ Error selecting max commented_at:', error);
    throw error;
  }
}
