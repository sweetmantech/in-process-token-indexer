import { INDEX_INTERVAL_MS } from '../consts';
import { indexMomentComments } from '../grpc/InProcess_Moment_Comments/indexMomentComments';
import { sleep } from '../utils/sleep';

/**
 * Indexes moment comments using commented_at for incremental indexing.
 * Runs continuously in a loop.
 */
export async function executeMomentCommentsIndexing(): Promise<void> {
  while (true) {
    try {
      const startTime = Date.now();

      console.log(`🔍 Indexing moment comments`);

      const comments = await indexMomentComments();

      if (comments.length)
        console.log(`📊 Indexed new ${comments.length} moment comments`);
      else console.log(`ℹ️  No new moment comments found`);

      const duration = Date.now() - startTime;
      console.log(`✅ Completed indexing moment comments (${duration}ms)`);

      // Wait before next iteration
      await sleep(INDEX_INTERVAL_MS);
    } catch (error) {
      console.error(`❌ Error in indexing cycle:`, error);
      // Wait before retrying even on error
      await sleep(INDEX_INTERVAL_MS);
    }
  }
}
