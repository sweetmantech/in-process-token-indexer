import {
  Catalog_Admins_t,
  InProcess_Admins_t,
  Sound_Admins_t,
} from '@/types/envio';
import { getCollectionIdMap } from '@/lib/collections/getCollectionIdMap';
import { DeleteAdminCriteria } from '@/types/supabase';

export async function mapAdminsForDeletion(
  admins: (InProcess_Admins_t | Catalog_Admins_t | Sound_Admins_t)[]
): Promise<DeleteAdminCriteria[]> {
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
      };
    })
    .filter((admin): admin is DeleteAdminCriteria => admin !== undefined);

  return mappedAdmins;
}
