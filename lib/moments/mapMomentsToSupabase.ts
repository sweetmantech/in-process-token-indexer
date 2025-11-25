import toSupabaseTimestamp from '../utils/toSupabaseTimestamp';
import { InProcess_Moments_t } from '../../types/envio';
import { Database } from '../supabase/types';
import { getCollectionIdMap } from '../supabase/in_process_collections/getCollectionIdMap';

/**
 * Maps Envio InProcess_Moments_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Resolves collection address+chain_id to collection ID.
 * - Converts max_supply from string (BigInt) to number.
 * - Serializes all values to primitive types for Supabase.
 *
 * @param moments - Array of InProcess_Moments_t from Envio.
 * @returns Array of objects formatted for Supabase upsert.
 */
export async function mapMomentsToSupabase(
  moments: InProcess_Moments_t[]
): Promise<
  Array<Database['public']['Tables']['in_process_moments']['Insert']>
> {
  const collectionPairs: Array<[string, number]> = moments.map(
    moment => [moment.collection, moment.chain_id] as [string, number]
  );
  const collectionIdMap = await getCollectionIdMap(collectionPairs);

  const mappedMoments = moments
    .map(moment => {
      const collectionId = collectionIdMap.get(
        `${moment.collection}:${moment.chain_id}`
      );
      if (!collectionId) {
        return undefined;
      }
      return {
        collection: collectionId,
        token_id: moment.token_id,
        uri: moment.uri,
        max_supply: Number(moment.max_supply)!,
        created_at: toSupabaseTimestamp(moment.created_at)!,
        updated_at: toSupabaseTimestamp(moment.updated_at)!,
      };
    })
    .filter(moment => moment !== undefined);

  return mappedMoments;
}
