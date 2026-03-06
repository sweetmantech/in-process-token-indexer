import toSupabaseTimestamp from '@/lib/toSupabaseTimestamp';
import { Catalog_Admins_t, InProcess_Admins_t } from '@/types/envio';
import { Database } from '@/lib/supabase/types';
import { getCollectionIdMap } from '@/lib/collections/getCollectionIdMap';

export async function mapAdminsToSupabase(
  admins: (InProcess_Admins_t | Catalog_Admins_t)[]
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
        token_id: Number(admin.token_id),
        artist_address: admin.admin.toLowerCase(),
        granted_at: toSupabaseTimestamp(admin.updated_at),
      };
    })
    .filter(admin => admin !== undefined);

  return mappedAdmins;
}
