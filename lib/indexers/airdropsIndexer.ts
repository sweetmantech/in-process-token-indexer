import { processAirdropsInBatches } from '@/lib/airdrops/processAirdropsInBatches';
import type { InProcess_Airdrops_t } from '@/types/envio';
import { selectMaxUpdatedAt } from '@/lib/airdrops/selectMaxUpdatedAt';
import { IndexFactory } from '@/lib/indexers/IndexFactory';
import { queryAirdrops } from '@/lib/grpc/queryAirdrops';

export const airdropsIndexer = new IndexFactory<InProcess_Airdrops_t>({
  queryFn: queryAirdrops,
  processBatchFn: processAirdropsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'airdrops',
});
