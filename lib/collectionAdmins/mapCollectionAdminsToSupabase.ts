import toSupabaseTimestamp from '../utils/toSupabaseTimestamp';
import { InProcess_Collection_Admins_t } from '../../types/envio';
import { Database } from '../supabase/types';
import { getCollectionIdMap } from '../collections/getCollectionIdMap';

/**
 * Maps Envio InProcess_Collection_Admins_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Skips admins whose (collection, chain_id) cannot be resolved to a collection ID.
 * - Maps admin address to artist_address.
 * - Converts granted_at from chain timestamp to ISO timestamp.
 *
 * @param collectionAdmins - Array of InProcess_Collection_Admins_t from Envio.
 * @returns Promise of objects formatted for Supabase upsert.
 */
export async function mapCollectionAdminsToSupabase(
  collectionAdmins: InProcess_Collection_Admins_t[]
): Promise<
  Database['public']['Tables']['in_process_collection_admins']['Insert'][]
> {
  const mappedAdmins: Array<
    Database['public']['Tables']['in_process_collection_admins']['Insert']
  > = [];

  const pairs = collectionAdmins.map(admin => [
    admin.collection,
    admin.chain_id,
  ]) as Array<[string, number]>;
  const collectionIdMap = await getCollectionIdMap(pairs);

  for (const admin of collectionAdmins) {
    const pairKey = `${admin.collection.toLowerCase()}:${admin.chain_id}`;
    const collectionId = collectionIdMap.get(pairKey);
    if (collectionId) {
      mappedAdmins.push({
        collection: collectionId,
        artist_address: admin.admin.toLowerCase(),
        granted_at: toSupabaseTimestamp(admin.granted_at),
      });
    }
  }

  return mappedAdmins;
}
