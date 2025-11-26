import { processSalesInBatches } from '@/lib/sales/processSalesInBatches';
import type { InProcess_Sales_t } from '@/types/envio';
import { selectMaxCreatedAt } from '@/lib/sales/selectMaxCreatedAt';
import { IndexFactory } from '@/lib/indexers/IndexFactory';
import { querySales } from '@/lib/grpc/querySales';

export const salesIndexer = new IndexFactory<InProcess_Sales_t>({
  queryFn: querySales,
  processBatchFn: processSalesInBatches,
  selectMaxTimestampFn: selectMaxCreatedAt,
  indexName: 'sales',
});
