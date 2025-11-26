import { indexSales } from '@/lib/grpc/InProcess_Sales/indexSales';
import { createExecuteIndexFunction } from '@/lib/factories/executeIndexFactory';
import { InProcess_Sales_t } from '@/types/envio';

/**
 * Indexes sales using created_at for incremental indexing.
 * Runs continuously in a loop.
 */
export const executeSalesIndexing =
  createExecuteIndexFunction<InProcess_Sales_t>({
    indexFn: indexSales,
    indexName: 'sales',
  });
