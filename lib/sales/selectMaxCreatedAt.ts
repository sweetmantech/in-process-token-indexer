import { selectSales } from '@/lib/supabase/in_process_sales/selectSales';

/**
 * Gets the maximum created_at timestamp from in_process_sales table.
 * Used for incremental indexing to only fetch records created after this timestamp.
 * @returns Maximum created_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxCreatedAt(): Promise<number | null> {
  try {
    const data = await selectSales({
      order: { column: 'created_at', ascending: false },
      limit: 1,
    });

    if (!data || data.length === 0 || !data[0]?.created_at) {
      return null;
    }

    // Convert ISO timestamp to milliseconds
    return new Date(data[0].created_at).getTime();
  } catch (error) {
    console.error('❌ Error selecting max created_at:', error);
    throw error;
  }
}
