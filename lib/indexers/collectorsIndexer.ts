import { processCollectorsInBatches } from '@/lib/collectors/processCollectorsInBatches';
import type { Collectors_t } from '@/types/envio';
import { selectMaxCollectedAt } from '@/lib/collectors/selectMaxCollectedAt';
import type { IndexConfig } from '@/types/factory';

export const collectorsIndexer: IndexConfig<Collectors_t> = {
  processBatchFn: processCollectorsInBatches,
  selectMaxTimestampFn: selectMaxCollectedAt,
  indexName: 'collectors',
  dataPath: 'Collectors',
  queryFragment: `Collectors(limit: $limit, offset: $offset_collectors, order_by: {collected_at: asc}, where: {collected_at: {_gt: $minTimestamp_collectors}}) {
    id collection token_id amount chain_id collector transaction_hash collected_at
  }`,
};
