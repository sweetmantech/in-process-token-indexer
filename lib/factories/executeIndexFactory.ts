import { INDEX_INTERVAL_MS } from '@/lib/consts';
import { sleep } from '@/lib/sleep';

/**
 * Factory function to create an execute indexing function that runs continuously.
 * Handles the loop, logging, error handling, and sleep intervals.
 * @param config - Configuration object with index function and index name.
 * @returns Execute function that runs the indexer in a continuous loop.
 */
export function createExecuteIndexFunction({
  indexFn,
  indexName,
}: {
  indexFn: () => Promise<any[]>;
  indexName: string;
}) {
  return async function executeIndexing(): Promise<void> {
    while (true) {
      try {
        const startTime = Date.now();

        console.log(`🔍 Indexing ${indexName}`);

        const entities = await indexFn();

        if (entities)
          console.log(`📊 Indexed new ${entities.length} ${indexName}`);
        else console.log(`ℹ️  No new ${indexName} found`);

        const duration = Date.now() - startTime;
        console.log(`✅ Completed indexing ${indexName} (${duration}ms)`);

        // Wait before next iteration
        await sleep(INDEX_INTERVAL_MS);
      } catch (error) {
        console.error(`❌ Error in ${indexName} indexing cycle:`, error);
        // Wait before retrying even on error
        await sleep(INDEX_INTERVAL_MS);
      }
    }
  };
}
