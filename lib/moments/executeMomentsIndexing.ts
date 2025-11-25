import { INDEX_INTERVAL_MS } from '../consts';
import { indexMoments } from '../grpc/InProcess_Moments/indexMoments';
import { sleep } from '../utils/sleep';

/**
 * Indexes moments.
 * Runs continuously in a loop.
 */
export async function executeMomentsIndexing(): Promise<void> {
  while (true) {
    try {
      const startTime = Date.now();

      console.log(`🔍 Indexing moments`);

      const moments = await indexMoments();

      if (moments.length)
        console.log(`📊 Indexed new ${moments.length} moments`);
      else console.log(`ℹ️  No new moments found`);

      const duration = Date.now() - startTime;
      console.log(
        `✅ Completed indexing moments for all chains (${duration}ms)`
      );

      // Wait before next iteration
      await sleep(INDEX_INTERVAL_MS);
    } catch (error) {
      console.error(`❌ Error in indexing cycle:`, error);
      // Wait before retrying even on error
      await sleep(INDEX_INTERVAL_MS);
    }
  }
}
