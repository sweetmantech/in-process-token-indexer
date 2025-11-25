import { processCollectionsInBatches } from '../../../lib/collections/processCollectionsInBatches';
import type { InProcess_Collections_t } from '../../../types/envio';
import { selectMaxUpdatedAt } from '../../supabase/in_process_collections/selectMaxUpdatedAt';
import { padChainId } from '../../utils/padChainId';
import { toChainTimestamp } from '../../utils/toChainTimestamp';
import { queryCollections } from './queryCollections';

/**
 * Fetches all collections from Envio GraphQL with pagination.
 * @param chainId - Chain ID to filter by (required).
 * @returns Array of all collections.
 */
export async function indexCollections(
  chainId: number
): Promise<InProcess_Collections_t[]> {
  const allCollections: InProcess_Collections_t[] = [];
  let offset = 0;
  const limit = 1000;
  let hasNextPage = true;

  // Get the latest updated_at from in_process_collections for incremental indexing
  const maxUpdatedAtSupabase = await selectMaxUpdatedAt(chainId);
  const minUpdatedAtEnvio = toChainTimestamp(
    maxUpdatedAtSupabase ?? new Date(0).getTime()
  );

  while (hasNextPage) {
    const collectionsResult = await queryCollections({
      chainId,
      limit,
      offset,
      minUpdatedAt: minUpdatedAtEnvio,
    });

    console.log(
      `💾 Chain ${padChainId(chainId)}: Processing ${allCollections.length} ~ ${allCollections.length + collectionsResult.collections.length}`
    );

    // ℹ️ Process fetched collections for this page (batch upserts handled in processCollectionsInBatches)
    await processCollectionsInBatches(collectionsResult.collections);

    hasNextPage = collectionsResult.pageInfo.hasNextPage;
    offset = collectionsResult.pageInfo.nextOffset;
    allCollections.push(...collectionsResult.collections);
  }

  return allCollections;
}
