import { processAdminsInBatches } from '@/lib/admins/processAdminsInBatches';
import type { InProcess_Admins_t } from '@/types/envio';
import { selectMaxGrantedAt } from '@/lib/admins/selectMaxGrantedAt';
import { toChainTimestamp } from '@/lib/toChainTimestamp';
import { queryAdmins } from './queryAdmins';

/**
 * Fetches all admins from Envio GraphQL with pagination.
 * @returns Array of all admins.
 */
export async function indexAdmins(): Promise<InProcess_Admins_t[]> {
  const allAdmins: InProcess_Admins_t[] = [];
  let offset = 0;
  const limit = 1000;
  let hasNextPage = true;

  // Get the latest granted_at from in_process_admins for incremental indexing
  const maxGrantedAtSupabase = await selectMaxGrantedAt();
  const minGrantedAtEnvio = toChainTimestamp(
    maxGrantedAtSupabase ?? new Date(0).getTime()
  );

  while (hasNextPage) {
    const adminsResult = await queryAdmins({
      limit,
      offset,
      minGrantedAt: minGrantedAtEnvio,
    });

    if (adminsResult.admins.length > 0) {
      console.log(
        `💾 Processing ${allAdmins.length} ~ ${allAdmins.length + adminsResult.admins.length} admins`
      );
    }

    // ℹ️ Process fetched admins for this page (batch upserts handled in processAdminsInBatches)
    await processAdminsInBatches(adminsResult.admins);

    hasNextPage = adminsResult.pageInfo.hasNextPage;
    offset = adminsResult.pageInfo.nextOffset;
    allAdmins.push(...adminsResult.admins);
  }

  return allAdmins;
}
