import { InProcess_Admins_t } from '@/types/envio';
import { getCollectionIdMap } from '@/lib/collections/getCollectionIdMap';
import { DeleteAdminCriteria } from '@/lib/supabase/in_process_admins/deleteAdmins';

/**
 * Maps Envio InProcess_Admins_t entities to deletion criteria.
 * - Resolves collection address+chain_id to collection ID.
 * - Maps admin address to artist_address.
 *
 * @param admins - Array of InProcess_Admins_t from Envio.
 * @returns Promise of deletion criteria objects.
 */
export async function mapAdminsForDeletion(
  admins: InProcess_Admins_t[]
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
        token_id: admin.token_id,
        artist_address: admin.admin.toLowerCase(),
      };
    })
    .filter((admin): admin is DeleteAdminCriteria => admin !== undefined);

  return mappedAdmins;
}
