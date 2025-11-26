import { processSalesInBatches } from '@/lib/sales/processSalesInBatches';
import type { InProcess_Sales_t } from '@/types/envio';
import { selectMaxCreatedAt } from '@/lib/sales/selectMaxCreatedAt';
import { createIndexFunction } from '@/lib/factories/indexFactory';
import { querySales } from './querySales';

/**
 * Fetches all sales from Envio GraphQL with pagination.
 * @returns Array of all sales.
 */
export const indexSales = createIndexFunction<InProcess_Sales_t>({
  queryFn: querySales,
  processBatchFn: processSalesInBatches,
  selectMaxTimestampFn: selectMaxCreatedAt,
  indexName: 'sales',
});
