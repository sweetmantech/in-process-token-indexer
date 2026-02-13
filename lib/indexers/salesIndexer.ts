import { processSalesInBatches } from '@/lib/sales/processSalesInBatches';
import type { InProcess_Sales_t } from '@/types/envio';
import { selectMaxCreatedAt } from '@/lib/sales/selectMaxCreatedAt';
import type { IndexConfig } from '@/types/factory';

export const salesIndexer: IndexConfig<InProcess_Sales_t> = {
  processBatchFn: processSalesInBatches,
  selectMaxTimestampFn: selectMaxCreatedAt,
  indexName: 'sales',
  dataPath: 'InProcess_Sales',
  queryFragment: `InProcess_Sales(limit: $limit, offset: $offset_sales, order_by: {created_at: asc}, where: {created_at: {_gt: $minTimestamp_sales}}) {
    id collection token_id sale_start sale_end max_tokens_per_address price_per_token funds_recipient currency chain_id transaction_hash created_at
  }`,
};
