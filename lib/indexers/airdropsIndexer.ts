import { processAirdropsInBatches } from '@/lib/airdrops/processAirdropsInBatches';
import type { InProcess_Airdrops_t } from '@/types/envio';
import { selectMaxUpdatedAt } from '@/lib/airdrops/selectMaxUpdatedAt';
import type { IndexConfig } from '@/types/factory';

export const airdropsIndexer: IndexConfig<InProcess_Airdrops_t> = {
  processBatchFn: processAirdropsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'airdrops',
  dataPath: 'InProcess_Airdrops',
  queryFragment: `InProcess_Airdrops(limit: $limit, offset: $offset_airdrops, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_airdrops}}) {
    id recipient collection token_id amount chain_id updated_at
  }`,
};
