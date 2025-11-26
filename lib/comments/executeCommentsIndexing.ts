import { INDEX_INTERVAL_MS } from '@/lib/consts';
import { indexComments } from '@/lib/grpc/InProcess_Moment_Comments/indexComments';
import { sleep } from '@/lib/sleep';

/**
 * Indexes moment comments using commented_at for incremental indexing.
 * Runs continuously in a loop.
 */
export async function executeCommentsIndexing(): Promise<void> {
  while (true) {
    try {
      const startTime = Date.now();

      console.log(`🔍 Indexing comments`);

      const comments = await indexComments();

      if (comments.length)
        console.log(`📊 Indexed new ${comments.length} comments`);
      else console.log(`ℹ️  No new comments found`);

      const duration = Date.now() - startTime;
      console.log(`✅ Completed indexing comments (${duration}ms)`);

      // Wait before next iteration
      await sleep(INDEX_INTERVAL_MS);
    } catch (error) {
      console.error(`❌ Error in indexing cycle:`, error);
      // Wait before retrying even on error
      await sleep(INDEX_INTERVAL_MS);
    }
  }
}
