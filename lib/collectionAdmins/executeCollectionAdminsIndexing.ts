import { INDEX_INTERVAL_MS } from '../consts';
import { indexCollectionAdmins } from '../grpc/InProcess_Collection_Admins/indexCollectionAdmins';
import { sleep } from '../utils/sleep';

/**
 * Indexes collection admins using granted_at for incremental indexing.
 * Runs continuously in a loop.
 */
export async function executeCollectionAdminsIndexing(): Promise<void> {
  while (true) {
    try {
      const startTime = Date.now();

      console.log(`🔍 Indexing collection admins`);

      const admins = await indexCollectionAdmins();

      if (admins.length)
        console.log(`📊 Indexed new ${admins.length} collection admins`);
      else console.log(`ℹ️  No new collection admins found`);

      const duration = Date.now() - startTime;
      console.log(`✅ Completed indexing collection admins (${duration}ms)`);

      // Wait before next iteration
      await sleep(INDEX_INTERVAL_MS);
    } catch (error) {
      console.error(`❌ Error in indexing cycle:`, error);
      // Wait before retrying even on error
      await sleep(INDEX_INTERVAL_MS);
    }
  }
}
