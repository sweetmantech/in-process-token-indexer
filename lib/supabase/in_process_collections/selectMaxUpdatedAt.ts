import { supabase } from '../client';

/**
 * Gets the maximum updated_at timestamp from in_process_collections table for a given chainId.
 * Used for incremental indexing to determine the starting point for fetching new records.
 * @param chainId - Chain ID to filter by.
 * @returns Maximum updated_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxUpdatedAt(
  chainId: number
): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('in_process_collections')
      .select('updated_at')
      .eq('chain_id', chainId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no records found, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!data || !data.updated_at) {
      return null;
    }

    // Convert ISO string to milliseconds timestamp
    return new Date(data.updated_at).getTime();
  } catch (error) {
    console.error(
      '❌ Failed to fetch max updated_at from in_process_collections:',
      error
    );
    return null;
  }
}
