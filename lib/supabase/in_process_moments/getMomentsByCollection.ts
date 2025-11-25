import { supabase } from '../client';
import { getCollectionIdMap } from '../../collections/getCollectionIdMap';

/**
 * Gets all moment IDs for collections (by collection address + chain_id pairs).
 * Uses Supabase query to fetch moments by collection IDs.
 * @param pairs - Array of [collection address, chain_id] pairs.
 * @returns Map with key as `${collectionAddress}:${chainId}` and value as array of moment IDs.
 */
export async function getMomentsByCollection(
  pairs: Array<[string, number]>
): Promise<Map<string, string[]>> {
  try {
    if (pairs.length === 0) {
      console.log('ℹ️  No collection pairs provided, returning empty map');
      return new Map<string, string[]>();
    }

    // Get collection IDs for all pairs
    const collectionIdMap = await getCollectionIdMap(pairs);

    if (collectionIdMap.size === 0) {
      console.log('ℹ️  No collection IDs found, returning empty map');
      return new Map<string, string[]>();
    }

    // Get unique collection IDs
    const uniqueCollectionIds = [...new Set(collectionIdMap.values())];

    // Query all moments for these collections
    // Using Supabase's query to get moments by collection IDs
    const { data: moments, error } = await supabase
      .from('in_process_moments')
      .select('id, collection')
      .in('collection', uniqueCollectionIds);

    if (error) {
      throw error;
    }

    // Group moments by collection ID
    const momentsByCollectionId = new Map<string, string[]>();
    if (moments) {
      for (const moment of moments) {
        if (!momentsByCollectionId.has(moment.collection)) {
          momentsByCollectionId.set(moment.collection, []);
        }
        momentsByCollectionId.get(moment.collection)!.push(moment.id);
      }
    }

    // Build final map: collectionAddress:chainId -> moment IDs array
    const result = new Map<string, string[]>();
    for (const [address, chainId] of pairs) {
      const collectionKey = `${address.toLowerCase()}:${chainId}`;
      const collectionId = collectionIdMap.get(collectionKey);
      if (collectionId) {
        const momentIds = momentsByCollectionId.get(collectionId) || [];
        result.set(collectionKey, momentIds);
      } else {
        result.set(collectionKey, []);
      }
    }

    const totalMoments = Array.from(result.values()).reduce(
      (sum, ids) => sum + ids.length,
      0
    );
    console.log(
      `✅ Retrieved ${totalMoments} moment(s) for ${pairs.length} collection(s)`
    );

    return result;
  } catch (error) {
    console.error(
      `❌ Failed to get moments for ${pairs.length} collection(s):`,
      error
    );
    throw error;
  }
}
