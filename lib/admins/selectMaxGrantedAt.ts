import { selectMax } from '@/lib/supabase/in_process_admins/selectMax';

/**
 * Gets the maximum granted_at timestamp from in_process_admins table.
 * Used for incremental indexing to only fetch records granted after this timestamp.
 * @returns Maximum granted_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxGrantedAt(): Promise<number | null> {
  const maxGrantedAt = await selectMax('granted_at');

  if (!maxGrantedAt) {
    return null;
  }

  return new Date(maxGrantedAt).getTime();
}
