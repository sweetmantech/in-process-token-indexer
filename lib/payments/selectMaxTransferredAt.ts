import { selectMax } from '@/lib/supabase/in_process_payments/selectMax';

/**
 * Gets the maximum transferred_at timestamp from in_process_payments table.
 * Used for incremental indexing to determine the starting point for fetching new records.
 * @returns Maximum transferred_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxTransferredAt(): Promise<number | null> {
  const maxTransferredAt = await selectMax('transferred_at');

  if (!maxTransferredAt) {
    return null;
  }

  return new Date(maxTransferredAt).getTime();
}
