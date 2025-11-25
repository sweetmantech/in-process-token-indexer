import toSupabaseTimestamp from '../utils/toSupabaseTimestamp';
import { InProcess_Moment_Admins_t } from '../../types/envio';
import { Database } from '../supabase/types';
import { getMomentIdMap } from '../supabase/in_process_moments/getMomentIdMap';
import { getMomentsByCollection } from '../supabase/in_process_moments/getMomentsByCollection';

/**
 * Maps Envio InProcess_Moment_Admins_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - If token_id = 0: Sets admin for ALL moments of the collection.
 * - If token_id != 0: Sets admin for specific token_id moment of the collection.
 * - Maps admin address to artist_address.
 * - Converts granted_at from chain timestamp to ISO timestamp.
 *
 * @param momentAdmins - Array of InProcess_Moment_Admins_t from Envio.
 * @returns Array of objects formatted for Supabase upsert.
 */
export async function mapMomentAdminsToSupabase(
  momentAdmins: InProcess_Moment_Admins_t[]
): Promise<
  Array<Database['public']['Tables']['in_process_moment_admins']['Insert']>
> {
  const mappedAdmins: Array<
    Database['public']['Tables']['in_process_moment_admins']['Insert']
  > = [];

  // Separate admins by token_id = 0 vs token_id != 0
  const collectionAdmins = momentAdmins.filter(admin => admin.token_id === 0);
  const specificAdmins = momentAdmins.filter(admin => admin.token_id !== 0);

  // Handle token_id = 0: Get all moments for each collection (batch query)
  if (collectionAdmins.length > 0) {
    const uniquePairs = Array.from(
      new Set(
        collectionAdmins.map(
          admin => `${admin.collection.toLowerCase()}:${admin.chain_id}`
        )
      )
    ).map(key => {
      const [address, chainId] = key.split(':');
      return [address, parseInt(chainId, 10)] as [string, number];
    });

    const momentsByCollection = await getMomentsByCollection(uniquePairs);

    for (const admin of collectionAdmins) {
      const collectionKey = `${admin.collection.toLowerCase()}:${admin.chain_id}`;
      const momentIds = momentsByCollection.get(collectionKey) || [];

      for (const momentId of momentIds) {
        mappedAdmins.push({
          moment: momentId,
          artist_address: admin.admin.toLowerCase(),
          granted_at: toSupabaseTimestamp(admin.granted_at)!,
          hidden: false,
        });
      }
    }
  }

  // Handle token_id != 0: Get specific moments
  if (specificAdmins.length > 0) {
    const triplets: Array<[string, number, number]> = specificAdmins.map(
      admin =>
        [admin.collection, admin.chain_id, admin.token_id] as [
          string,
          number,
          number,
        ]
    );
    const momentIdMap = await getMomentIdMap(triplets);

    for (const admin of specificAdmins) {
      const tripletKey = `${admin.collection.toLowerCase()}:${admin.chain_id}:${admin.token_id}`;
      const momentId = momentIdMap.get(tripletKey);
      if (momentId) {
        mappedAdmins.push({
          moment: momentId,
          artist_address: admin.admin.toLowerCase(),
          granted_at: toSupabaseTimestamp(admin.granted_at)!,
          hidden: false,
        });
      }
    }
  }

  return mappedAdmins;
}
