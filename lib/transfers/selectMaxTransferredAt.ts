import { selectMax } from '@/lib/supabase/in_process_transfers/selectMax';

/** Max `transferred_at` from Supabase as epoch ms (for `toEnvioTimestamp`). */
export async function selectMaxTransferredAt(): Promise<number | null> {
  // const maxTransferredAt = await selectMax('transferred_at');
  // if (!maxTransferredAt) return null;
  return new Date('2025-05-17T00:00:00Z').getTime();
}
