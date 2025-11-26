import { processCollectionsInBatches } from '@/lib/collections/processCollectionsInBatches';
import { selectMaxUpdatedAt } from '@/lib/collections/selectMaxUpdatedAt';
import type {
  InProcess_Collections_t,
  CollectionsQueryResult,
} from '@/types/envio';
import { createIndexFunction } from '@/lib/grpc/indexFactory';
import { queryCollections } from './queryCollections';

/**
 * Fetches all collections from Envio GraphQL with pagination.
 * @returns Array of all collections.
 */
export const indexCollections = createIndexFunction<
  InProcess_Collections_t,
  CollectionsQueryResult
>({
  queryFn: queryCollections,
  processBatchFn: processCollectionsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'collections',
});
