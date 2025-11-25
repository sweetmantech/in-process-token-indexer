import { supabase } from '../client';

/**
 * Gets collection IDs from Supabase for given [address, chain_id] pairs
 * and returns a Map mapping those pairs to collection IDs.
 * @param pairs - Array of [address, chain_id] pairs to query.
 * @returns Map with key as `${address}:${chainId}` and value as collection ID.
 */
export async function getCollectionIdMapByPairs(
  pairs: Array<[string, number]>
): Promise<Map<string, string>> {
  try {
    if (pairs.length === 0) {
      console.log('ℹ️  No collection pairs provided, returning empty map');
      return new Map<string, string>();
    }

    // Get unique addresses from pairs
    const uniqueAddresses = [...new Set(pairs.map(([address]) => address.toLowerCase()))];

    // Query collections by addresses
    const { data, error } = await supabase
      .from('in_process_collections')
      .select('id, address, chain_id')
      .in('address', uniqueAddresses);

    if (error) {
      throw error;
    }

    const collectionMap = new Map<string, string>();

    if (data) {
      // Create a Set of requested pairs for efficient lookup
      const requestedPairs = new Set(
        pairs.map(([address, chainId]) => `${address.toLowerCase()}:${chainId}`)
      );

      // Filter results to only include exact pairs that were requested
      for (const collection of data) {
        const key = `${collection.address.toLowerCase()}:${collection.chain_id}`;
        if (requestedPairs.has(key)) {
          collectionMap.set(key, collection.id);
        }
      }
    }

    console.log(
      `✅ Retrieved ${collectionMap.size} collection ID(s) from Supabase for ${pairs.length} pair(s)`
    );

    return collectionMap;
  } catch (error) {
    console.error(
      `❌ Failed to get collection IDs for ${pairs.length} pair(s):`,
      error
    );
    throw error;
  }
}