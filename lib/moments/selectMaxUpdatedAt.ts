import { selectMax } from '@/lib/supabase/in_process_moments/selectMax';

/**
 * Gets the maximum updated_at timestamp from in_process_moments table.
 * Used for incremental indexing to determine the starting point for fetching new records.
 * @returns Maximum updated_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxUpdatedAt(): Promise<number | null> {
  const maxUpdatedAt = await selectMax('updated_at');

  if (!maxUpdatedAt) {
    return null;
  }

  return new Date(maxUpdatedAt).getTime();
}
