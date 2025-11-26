import { processMomentsInBatches } from '@/lib/moments/processMomentsInBatches';
import { selectMaxUpdatedAt } from '@/lib/moments/selectMaxUpdatedAt';
import type { InProcess_Moments_t } from '@/types/envio';
import { IndexFactory } from '@/lib/indexers/IndexFactory';
import { queryMoments } from '@/lib/grpc/queryMoments';

export const momentsIndexer = new IndexFactory<InProcess_Moments_t>({
  queryFn: queryMoments,
  processBatchFn: processMomentsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'moments',
});
