import {
  InProcess_Admins_t,
  InProcess_Moment_Comments_t,
  InProcess_Sales_t,
  InProcess_Payments_t,
  InProcess_Airdrops_t,
  InProcess_Collectors_t,
} from '@/types/envio';
import { InProcessMoment } from '@/types/supabase';
import { selectMoments } from '@/lib/supabase/in_process_moments/selectMoments';

/**
 * Gets moment IDs from Supabase for given entities
 * and returns a Map mapping [collection address, chain_id, token_id] triplets to moment IDs.
 * @param entities - Array of InProcess_Admins_t, InProcess_Moment_Comments_t, InProcess_Sales_t, InProcess_Payments_t, or InProcess_Airdrops_t to query moments for.
 * @returns Map with key as `${collectionAddress}:${chainId}:${tokenId}` and value as moment ID.
 */
export async function getMomentIdMap(
  entities:
    | InProcess_Admins_t[]
    | InProcess_Moment_Comments_t[]
    | InProcess_Sales_t[]
    | InProcess_Payments_t[]
    | InProcess_Airdrops_t[]
    | InProcess_Collectors_t[]
): Promise<Map<string, string>> {
  try {
    if (entities.length === 0) {
      console.log('ℹ️  No entities provided, returning empty map');
      return new Map<string, string>();
    }

    const collectionAddresses = entities.map(admin =>
      admin.collection.toLowerCase()
    );
    const tokenIds = entities.map(entity => Number(entity.token_id));

    const data = (await selectMoments({
      collectionAddresses,
      tokenIds,
    })) as InProcessMoment[];

    const momentMap = new Map<string, string>();

    // Create a Set of requested triplets for efficient lookup
    const requestedTriplets = new Set(
      entities.map(
        entity =>
          `${entity.collection.toLowerCase()}:${entity.chain_id}:${entity.token_id}`
      )
    );

    // Filter results to only include exact triplets that were requested
    for (const moment of data) {
      const key = `${moment.collection.address.toLowerCase()}:${moment.collection.chain_id}:${moment.token_id}`;
      if (requestedTriplets.has(key)) {
        momentMap.set(key, moment.id);
      }
    }

    console.log(
      `✅ Retrieved ${momentMap.size} moment ID(s) from Supabase for ${entities.length} entity(ies)`
    );

    return momentMap;
  } catch (error) {
    console.error(
      `❌ Failed to get moment IDs for ${entities.length} entity(ies):`,
      error
    );
    throw error;
  }
}
