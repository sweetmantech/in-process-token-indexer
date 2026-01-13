import { selectAirdrops } from '@/lib/supabase/in_process_airdrops/selectAirdrops';

/**
 * Gets the maximum updated_at timestamp from in_process_airdrops table.
 * Used for incremental indexing to only fetch records updated after this timestamp.
 * @returns Maximum updated_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxUpdatedAt(): Promise<number | null> {
  try {
    const data = await selectAirdrops({
      order: { column: 'updated_at', ascending: false },
      limit: 1,
    });

    if (!data || data.length === 0 || !data[0]?.updated_at) {
      return null;
    }

    // Convert ISO timestamp to milliseconds
    return new Date(data[0].updated_at).getTime();
  } catch (error) {
    console.error('❌ Error selecting max updated_at:', error);
    throw error;
  }
}
