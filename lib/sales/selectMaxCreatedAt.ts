import { selectMax } from '@/lib/supabase/in_process_sales/selectMax';

/**
 * Gets the maximum created_at timestamp from in_process_sales table.
 * Used for incremental indexing to only fetch records created after this timestamp.
 * @returns Maximum created_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxCreatedAt(): Promise<number | null> {
  const maxCreatedAt = await selectMax('created_at');

  if (!maxCreatedAt) {
    return null;
  }

  return new Date(maxCreatedAt).getTime();
}
