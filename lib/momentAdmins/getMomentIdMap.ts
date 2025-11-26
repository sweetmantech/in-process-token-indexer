import {
  InProcess_Moment_Admins_t,
  InProcess_Moment_Comments_t,
  InProcess_Sales_t,
} from '@/types/envio';
import { InProcessMoment } from '@/types/moments';
import { selectMoments } from '@/lib/supabase/in_process_moments/selectMoments';

/**
 * Gets moment IDs from Supabase for given moment admins
 * and returns a Map mapping [collection address, chain_id, token_id] triplets to moment IDs.
 * @param momentAdmins - Array of InProcess_Moment_Admins_t to query moments for.
 * @returns Map with key as `${collectionAddress}:${chainId}:${tokenId}` and value as moment ID.
 */
export async function getMomentIdMap(
  momentAdmins:
    | InProcess_Moment_Admins_t[]
    | InProcess_Moment_Comments_t[]
    | InProcess_Sales_t[]
): Promise<Map<string, string>> {
  try {
    if (momentAdmins.length === 0) {
      console.log('ℹ️  No moment admins provided, returning empty map');
      return new Map<string, string>();
    }

    const collectionAddresses = momentAdmins.map(admin =>
      admin.collection.toLowerCase()
    );
    const tokenIds = momentAdmins.map(admin => Number(admin.token_id));

    const data = (await selectMoments({
      collectionAddresses,
      tokenIds,
    })) as InProcessMoment[];

    const momentMap = new Map<string, string>();

    // Create a Set of requested triplets for efficient lookup
    const requestedTriplets = new Set(
      momentAdmins.map(
        admin =>
          `${admin.collection.toLowerCase()}:${admin.chain_id}:${admin.token_id}`
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
      `✅ Retrieved ${momentMap.size} moment ID(s) from Supabase for ${momentAdmins.length} admin(s)`
    );

    return momentMap;
  } catch (error) {
    console.error(
      `❌ Failed to get moment IDs for ${momentAdmins.length} admin(s):`,
      error
    );
    throw error;
  }
}
