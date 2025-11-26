import { processSalesInBatches } from '@/lib/sales/processSalesInBatches';
import type { InProcess_Sales_t } from '@/types/envio';
import { selectMaxCreatedAt } from '@/lib/supabase/in_process_sales/selectMaxCreatedAt';
import { toChainTimestamp } from '@/lib/utils/toChainTimestamp';
import { querySales } from './querySales';

/**
 * Fetches all sales from Envio GraphQL with pagination.
 * @returns Array of all sales.
 */
export async function indexSales(): Promise<InProcess_Sales_t[]> {
  const allSales: InProcess_Sales_t[] = [];
  let offset = 0;
  const limit = 1000;
  let hasNextPage = true;

  // Get the latest created_at from in_process_sales for incremental indexing
  const maxCreatedAtSupabase = await selectMaxCreatedAt();
  const minCreatedAtEnvio = toChainTimestamp(
    maxCreatedAtSupabase ?? new Date(0).getTime()
  );

  while (hasNextPage) {
    const salesResult = await querySales({
      limit,
      offset,
      minCreatedAt: minCreatedAtEnvio,
    });

    if (salesResult.sales.length > 0) {
      console.log(
        `💾 Processing ${allSales.length} ~ ${allSales.length + salesResult.sales.length}`
      );
    }

    // ℹ️ Process fetched sales for this page (batch upserts handled in processSalesInBatches)
    await processSalesInBatches(salesResult.sales);

    hasNextPage = salesResult.pageInfo.hasNextPage;
    offset = salesResult.pageInfo.nextOffset;
    allSales.push(...salesResult.sales);
  }

  return allSales;
}
