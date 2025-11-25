import { supabase } from '../client';

/**
 * Gets the maximum updated_at timestamp from in_process_moments table for a given chainId.
 * Since moments table doesn't have chain_id, we need to filter by collection IDs
 * that belong to the chain. This is done by querying all collections for the chain,
 * then finding the max updated_at from moments for those collections.
 *
 * @param chainId - Chain ID to filter by.
 * @returns Maximum updated_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxUpdatedAt(
  chainId: number
): Promise<number | null> {
  try {
    // First, get all collection addresses for this chain
    const { data: collections, error: collectionsError } = await supabase
      .from('in_process_collections')
      .select('id')
      .eq('chain_id', chainId);

    if (collectionsError) {
      throw collectionsError;
    }

    if (!collections || collections.length === 0) {
      return null;
    }

    const collectionIds = collections.map(c => c.id);

    // Then get max updated_at from moments for these collections
    const { data, error } = await supabase
      .from('in_process_moments')
      .select('updated_at')
      .in('collection', collectionIds)
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

