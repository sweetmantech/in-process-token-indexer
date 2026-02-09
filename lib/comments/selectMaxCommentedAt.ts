import { selectMax } from '@/lib/supabase/in_process_moment_comments/selectMax';

/**
 * Gets the maximum commented_at timestamp from in_process_moment_comments table.
 * Used for incremental indexing to only fetch records commented after this timestamp.
 * @returns Maximum commented_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxCommentedAt(): Promise<number | null> {
  const maxCommentedAt = await selectMax('commented_at');

  if (!maxCommentedAt) {
    return null;
  }

  return new Date(maxCommentedAt).getTime();
}
