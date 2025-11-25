import { supabase } from '../client';

/**
 * Gets moment IDs from Supabase for given [collection address, chain_id, token_id] triplets
 * and returns a Map mapping those triplets to moment IDs.
 * @param triplets - Array of [collection address, chain_id, token_id] triplets to query.
 * @returns Map with key as `${collectionAddress}:${chainId}:${tokenId}` and value as moment ID.
 */
export async function getMomentIdMap(
  triplets: Array<[string, number, number]>
): Promise<Map<string, string>> {
  try {
    if (triplets.length === 0) {
      console.log('ℹ️  No moment triplets provided, returning empty map');
      return new Map<string, string>();
    }

    // Get unique collection addresses from triplets
    const uniqueAddresses = [
      ...new Set(triplets.map(([address]) => address.toLowerCase())),
    ];

    // First, get collection IDs for these addresses
    const { data: collections, error: collectionsError } = await supabase
      .from('in_process_collections')
      .select('id, address, chain_id')
      .in('address', uniqueAddresses);

    if (collectionsError) {
      throw collectionsError;
    }

    // Create a map of collection address+chain_id -> collection ID
    const collectionIdMap = new Map<string, string>();
    if (collections) {
      for (const collection of collections) {
        const key = `${collection.address.toLowerCase()}:${collection.chain_id}`;
        collectionIdMap.set(key, collection.id);
      }
    }

    // Get unique collection IDs
    const uniqueCollectionIds = [...new Set(collectionIdMap.values())];

    if (uniqueCollectionIds.length === 0) {
      console.log('ℹ️  No collection IDs found, returning empty map');
      return new Map<string, string>();
    }

    // Query moments by collection IDs
    const { data: moments, error: momentsError } = await supabase
      .from('in_process_moments')
      .select('id, collection, token_id')
      .in('collection', uniqueCollectionIds);

    if (momentsError) {
      throw momentsError;
    }

    // Create a map of collection ID -> moments by token_id
    const momentsByCollection = new Map<string, Map<number, string>>();
    if (moments) {
      for (const moment of moments) {
        if (!momentsByCollection.has(moment.collection)) {
          momentsByCollection.set(moment.collection, new Map());
        }
        momentsByCollection
          .get(moment.collection)!
          .set(moment.token_id, moment.id);
      }
    }

    // Build final map: collectionAddress:chainId:tokenId -> moment ID
    const momentIdMap = new Map<string, string>();
    for (const [address, chainId, tokenId] of triplets) {
      const collectionKey = `${address.toLowerCase()}:${chainId}`;
      const collectionId = collectionIdMap.get(collectionKey);
      if (collectionId) {
        const momentsForCollection = momentsByCollection.get(collectionId);
        if (momentsForCollection) {
          const momentId = momentsForCollection.get(tokenId);
          if (momentId) {
            const tripletKey = `${address.toLowerCase()}:${chainId}:${tokenId}`;
            momentIdMap.set(tripletKey, momentId);
          }
        }
      }
    }

    console.log(
      `✅ Retrieved ${momentIdMap.size} moment ID(s) from Supabase for ${triplets.length} triplet(s)`
    );

    return momentIdMap;
  } catch (error) {
    console.error(
      `❌ Failed to get moment IDs for ${triplets.length} triplet(s):`,
      error
    );
    throw error;
  }
}
