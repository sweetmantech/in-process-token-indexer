import toSupabaseTimestamp from '@/lib/toSupabaseTimestamp';
import { InProcess_Admins_t } from '@/types/envio';
import { Database } from '@/lib/supabase/types';
import { getCollectionIdMap } from '@/lib/collections/getCollectionIdMap';

/**
 * Maps Envio InProcess_Admins_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Resolves collection address+chain_id to collection ID.
 * - Maps admin address to artist_address.
 * - Converts granted_at from chain timestamp to ISO timestamp.
 *
 * @param admins - Array of InProcess_Admins_t from Envio.
 * @returns Promise of objects formatted for Supabase upsert.
 */
export async function mapAdminsToSupabase(
  admins: InProcess_Admins_t[]
): Promise<Database['public']['Tables']['in_process_admins']['Insert'][]> {
  const collectionPairs: Array<[string, number]> = admins.map(
    admin => [admin.collection, admin.chain_id] as [string, number]
  );
  const collectionIdMap = await getCollectionIdMap(collectionPairs);

  const mappedAdmins = admins
    .map(admin => {
      const collectionId = collectionIdMap.get(
        `${admin.collection.toLowerCase()}:${admin.chain_id}`
      );
      if (!collectionId) {
        return undefined;
      }
      return {
        collection: collectionId,
        token_id: admin.token_id,
        artist_address: admin.admin.toLowerCase(),
        granted_at: toSupabaseTimestamp(admin.granted_at),
      };
    })
    .filter(admin => admin !== undefined);

  return mappedAdmins;
}
