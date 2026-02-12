import { selectMax } from '@/lib/supabase/in_process_collectors/selectMax';

/**
 * Gets the maximum collected_at timestamp from in_process_collectors table.
 * Used for incremental indexing to only fetch records collected after this timestamp.
 * @returns Maximum collected_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxCollectedAt(): Promise<number | null> {
  const maxCollectedAt = await selectMax('collected_at');

  if (!maxCollectedAt) {
    return null;
  }

  return new Date(maxCollectedAt).getTime();
}
