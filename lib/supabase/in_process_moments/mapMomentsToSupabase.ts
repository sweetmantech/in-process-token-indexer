import toSupabaseTimestamp from '../../utils/toSupabaseTimestamp';
import { InProcess_Moments_t } from '../../../types/envio';
import { Database } from '../types';
import { getCollectionId } from '../in_process_collections/getCollectionId';

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
  const mappedMoments = await Promise.all(
    moments.map(async moment => {
      // Resolve collection ID from address and chain_id
      const collectionId = await getCollectionId(
        moment.collection,
        moment.chain_id
      );

      if (!collectionId) {
        throw new Error(
          `⚠️ Collection not found: ${moment.collection} on chain ${moment.chain_id}`
        );
      }

      // Convert max_supply from string (BigInt) to number
      const maxSupply = Number(moment.max_supply);
      if (!Number.isFinite(maxSupply) || maxSupply < 0) {
        throw new Error(
          `❌ Invalid max_supply for moment ${moment.id}: ${moment.max_supply}`
        );
      }

      return {
        collection: collectionId,
        token_id: moment.token_id,
        uri: moment.uri,
        max_supply: maxSupply,
        created_at: toSupabaseTimestamp(moment.created_at),
        updated_at: toSupabaseTimestamp(moment.updated_at),
      };
    })
  );

  return mappedMoments;
}
