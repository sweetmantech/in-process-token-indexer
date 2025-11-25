import { processMomentsInBatches } from '../../../lib/moments/processMomentsInBatches';
import type { InProcess_Moments_t } from '../../../types/envio';
import { selectMaxUpdatedAt } from '../../supabase/in_process_moments/selectMaxUpdatedAt';
import { toChainTimestamp } from '../../utils/toChainTimestamp';
import { queryMoments } from './queryMoments';

/**
 * Fetches all moments from Envio GraphQL with pagination.
 * @returns Array of all moments.
 */
export async function indexMoments(): Promise<InProcess_Moments_t[]> {
  const allMoments: InProcess_Moments_t[] = [];
  let offset = 0;
  const limit = 1000;
  let hasNextPage = true;

  // Get the latest updated_at from in_process_moments for incremental indexing
  const maxUpdatedAtSupabase = await selectMaxUpdatedAt();
  const minUpdatedAtEnvio = toChainTimestamp(new Date(0).getTime());

  while (hasNextPage) {
    const momentsResult = await queryMoments({
      limit,
      offset,
      minUpdatedAt: minUpdatedAtEnvio,
    });

    if (momentsResult.moments.length > 0) {
      console.log(
        `💾 Processing ${allMoments.length} ~ ${allMoments.length + momentsResult.moments.length}`
      );
    }

    // ℹ️ Process fetched moments for this page (batch upserts handled in processMomentsInBatches)
    await processMomentsInBatches(momentsResult.moments);

    hasNextPage = momentsResult.pageInfo.hasNextPage;
    offset = momentsResult.pageInfo.nextOffset;
    allMoments.push(...momentsResult.moments);
  }

  return allMoments;
}
