import { processMomentAdminsInBatches } from '../../../lib/momentAdmins/processMomentAdminsInBatches';
import type { InProcess_Moment_Admins_t } from '../../../types/envio';
import { selectMaxGrantedAt } from '../../supabase/in_process_moment_admins/selectMaxGrantedAt';
import { toChainTimestamp } from '../../utils/toChainTimestamp';
import { queryMomentAdmins } from './queryMomentAdmins';

/**
 * Fetches all moment admins from Envio GraphQL with pagination.
 * @returns Array of all moment admins.
 */
export async function indexMomentAdmins(): Promise<
  InProcess_Moment_Admins_t[]
> {
  const allAdmins: InProcess_Moment_Admins_t[] = [];
  let offset = 0;
  const limit = 1000;
  let hasNextPage = true;

  // Get the latest granted_at from in_process_moment_admins for incremental indexing
  const maxGrantedAtSupabase = await selectMaxGrantedAt();
  const minGrantedAtEnvio = toChainTimestamp(
    maxGrantedAtSupabase ?? new Date(0).getTime()
  );

  while (hasNextPage) {
    const adminsResult = await queryMomentAdmins({
      limit,
      offset,
      minGrantedAt: minGrantedAtEnvio,
    });

    if (adminsResult.momentAdmins.length > 0) {
      console.log(
        `💾 Processing ${allAdmins.length} ~ ${allAdmins.length + adminsResult.momentAdmins.length}`
      );
    }

    // ℹ️ Process fetched admins for this page (batch upserts handled in processMomentAdminsInBatches)
    await processMomentAdminsInBatches(adminsResult.momentAdmins);

    hasNextPage = adminsResult.pageInfo.hasNextPage;
    offset = adminsResult.pageInfo.nextOffset;
    allAdmins.push(...adminsResult.momentAdmins);
  }

  return allAdmins;
}
