import { indexSales } from '@/lib/grpc/InProcess_Sales/indexSales';
import { createExecuteIndexFunction } from '@/lib/factories/executeIndexFactory';

/**
 * Indexes sales using created_at for incremental indexing.
 * Runs continuously in a loop.
 */
export const executeSalesIndexing = createExecuteIndexFunction({
  indexFn: indexSales,
  indexName: 'sales',
});
