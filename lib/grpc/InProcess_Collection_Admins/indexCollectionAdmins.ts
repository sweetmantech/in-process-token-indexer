import { processCollectionAdminsInBatches } from '../../../lib/collectionAdmins/processCollectionAdminsInBatches';
import type { InProcess_Collection_Admins_t } from '../../../types/envio';
import { selectMaxGrantedAt } from '../../supabase/in_process_collection_admins/selectMaxGrantedAt';
import { toChainTimestamp } from '../../utils/toChainTimestamp';
import { queryCollectionAdmins } from './queryCollectionAdmins';

/**
 * Fetches all collection admins from Envio GraphQL with pagination.
 * @returns Array of all collection admins.
 */
export async function indexCollectionAdmins(): Promise<
  InProcess_Collection_Admins_t[]
> {
  const allAdmins: InProcess_Collection_Admins_t[] = [];
  let offset = 0;
  const limit = 1000;
  let hasNextPage = true;

  // Get the latest granted_at from in_process_collection_admins for incremental indexing
  const maxGrantedAtSupabase = await selectMaxGrantedAt();
  const minGrantedAtEnvio = toChainTimestamp(
    maxGrantedAtSupabase ?? new Date(0).getTime()
  );

  while (hasNextPage) {
    const adminsResult = await queryCollectionAdmins({
      limit,
      offset,
      minGrantedAt: minGrantedAtEnvio,
    });

    if (adminsResult.collectionAdmins.length > 0) {
      console.log(
        `💾 Processing ${allAdmins.length} ~ ${allAdmins.length + adminsResult.collectionAdmins.length}`
      );
    }

    // ℹ️ Process fetched admins for this page (batch upserts handled in processCollectionAdminsInBatches)
    await processCollectionAdminsInBatches(adminsResult.collectionAdmins);

    hasNextPage = adminsResult.pageInfo.hasNextPage;
    offset = adminsResult.pageInfo.nextOffset;
    allAdmins.push(...adminsResult.collectionAdmins);
  }

  return allAdmins;
}
