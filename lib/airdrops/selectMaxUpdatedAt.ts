import { selectMax } from '@/lib/supabase/in_process_airdrops/selectMax';

/**
 * Gets the maximum updated_at timestamp from in_process_airdrops table.
 * Used for incremental indexing to only fetch records updated after this timestamp.
 * @returns Maximum updated_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxUpdatedAt(): Promise<number | null> {
  const maxUpdatedAt = await selectMax('updated_at');

  if (!maxUpdatedAt) {
    return null;
  }

  return new Date(maxUpdatedAt).getTime();
}
