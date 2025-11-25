import { INDEX_INTERVAL_MS } from '../consts';
import { indexSales } from '../grpc/InProcess_Sales/indexSales';
import { sleep } from '../utils/sleep';

/**
 * Indexes sales using created_at for incremental indexing.
 * Runs continuously in a loop.
 */
export async function executeSalesIndexing(): Promise<void> {
  while (true) {
    try {
      const startTime = Date.now();

      console.log(`🔍 Indexing sales`);

      const sales = await indexSales();

      if (sales.length) console.log(`📊 Indexed new ${sales.length} sales`);
      else console.log(`ℹ️  No new sales found`);

      const duration = Date.now() - startTime;
      console.log(`✅ Completed indexing sales (${duration}ms)`);

      // Wait before next iteration
      await sleep(INDEX_INTERVAL_MS);
    } catch (error) {
      console.error(`❌ Error in indexing cycle:`, error);
      // Wait before retrying even on error
      await sleep(INDEX_INTERVAL_MS);
    }
  }
}
