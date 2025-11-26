import { processCollectionsInBatches } from '@/lib/collections/processCollectionsInBatches';
import { selectMaxUpdatedAt } from '@/lib/collections/selectMaxUpdatedAt';
import type { InProcess_Collections_t } from '@/types/envio';
import { IndexFactory } from '@/lib/indexers/IndexFactory';
import { queryCollections } from '@/lib/grpc/queryCollections';

export const collectionsIndexer = new IndexFactory<InProcess_Collections_t>({
  queryFn: queryCollections,
  processBatchFn: processCollectionsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'collections',
});
