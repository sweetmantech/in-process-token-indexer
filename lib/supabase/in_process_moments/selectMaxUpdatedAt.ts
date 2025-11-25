import { supabase } from '../client';

/**
 * Gets the maximum updated_at timestamp from in_process_moments table for a given chainId.
 * @param chainId - Chain ID to filter by.
 * @returns Maximum updated_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxUpdatedAt(): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('in_process_moments')
      .select('updated_at')
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
      '❌ Failed to fetch max updated_at from in_process_moments:',
      error
    );
    return null;
  }
}
