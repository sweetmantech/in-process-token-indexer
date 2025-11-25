import { supabase } from '../client';

/**
 * Gets the maximum created_at timestamp from in_process_sales table.
 * Used for incremental indexing to only fetch records created after this timestamp.
 * @returns Maximum created_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxCreatedAt(): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('in_process_sales')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // PGRST116 means no rows found, which is fine for initial sync
      if (error.code === 'PGRST116') {
        console.log('ℹ️  No sales found in Supabase, starting from beginning');
        return null;
      }
      throw error;
    }

    if (!data || !data.created_at) {
      return null;
    }

    // Convert ISO timestamp to milliseconds
    const maxCreatedAt = new Date(data.created_at).getTime();
    return maxCreatedAt;
  } catch (error) {
    console.error('❌ Error selecting max created_at:', error);
    throw error;
  }
}
