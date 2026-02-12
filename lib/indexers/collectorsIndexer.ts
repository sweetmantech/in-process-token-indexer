import { processCollectorsInBatches } from '@/lib/collectors/processCollectorsInBatches';
import type { InProcess_Collectors_t } from '@/types/envio';
import { selectMaxCollectedAt } from '@/lib/collectors/selectMaxCollectedAt';
import { IndexFactory } from '@/lib/indexers/IndexFactory';
import { queryCollectors } from '@/lib/grpc/queryCollectors';

export const collectorsIndexer = new IndexFactory<InProcess_Collectors_t>({
  queryFn: queryCollectors,
  processBatchFn: processCollectorsInBatches,
  selectMaxTimestampFn: selectMaxCollectedAt,
  indexName: 'collectors',
});
