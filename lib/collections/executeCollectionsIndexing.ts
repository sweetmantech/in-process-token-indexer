import { INDEX_INTERVAL_MS } from '../consts';
import { indexCollections } from '../grpc/InProcess_Collections/indexCollections';
import { sleep } from '../utils/sleep';

/**
 * Indexes collections.
 * Runs continuously in a loop.
 */
export async function executeCollectionsIndexing(): Promise<void> {
  while (true) {
    try {
      const startTime = Date.now();

      console.log(`🔍 Indexing collections`);
      const collections = await indexCollections();
      if (collections.length)
        console.log(`📊 Indexed new ${collections.length} collections`);
      else console.log(`ℹ️  No new collections found`);

      const duration = Date.now() - startTime;
      console.log(
        `✅ Completed indexing collections for all chains (${duration}ms)`
      );

      // Wait before next iteration
      await sleep(INDEX_INTERVAL_MS);
    } catch (error) {
      console.error(`❌ Error in collections indexing cycle:`, error);
      // Wait before retrying even on error
      await sleep(INDEX_INTERVAL_MS);
    }
  }
}
