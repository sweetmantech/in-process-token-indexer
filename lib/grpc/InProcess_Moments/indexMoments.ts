import { processMomentsInBatches } from '@/lib/moments/processMomentsInBatches';
import { selectMaxUpdatedAt } from '@/lib/moments/selectMaxUpdatedAt';
import type { InProcess_Moments_t } from '@/types/envio';
import { createIndexFunction } from '@/lib/factories/indexFactory';
import { queryMoments } from './queryMoments';

/**
 * Fetches all moments from Envio GraphQL with pagination.
 * @returns Array of all moments.
 */
export const indexMoments = createIndexFunction<InProcess_Moments_t>({
  queryFn: queryMoments,
  processBatchFn: processMomentsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'moments',
});
