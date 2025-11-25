import { NETWORKS, INDEX_INTERVAL_MS } from '../consts';
import { indexCollections } from '../grpc/InProcess_Collections/indexCollections';
import { padChainId } from '../utils/padChainId';
import { sleep } from '../utils/sleep';

/**
 * Indexes collections in parallel for all configured chains.
 * Runs continuously in a loop.
 */
export async function executeCollectionsIndexingParallel(): Promise<void> {
  const chainIds = NETWORKS.map(network => network.id);

  while (true) {
    try {
      const startTime = Date.now();

      await Promise.all(
        chainIds.map(async chainId => {
          try {
            console.log(
              `🔍 Chain ${padChainId(chainId)}: Indexing collections`
            );
            const collections = await indexCollections(chainId);
            if (collections.length)
              console.log(
                `📊 Chain ${padChainId(chainId)}: Indexed new ${collections.length} collections`
              );
            else
              console.log(
                `ℹ️  Chain ${padChainId(chainId)}: No new collections found`
              );
          } catch (error) {
            console.error(
              `❌ Chain ${padChainId(chainId)}: Failed to index collections:`,
              error
            );
          }
        })
      );

      const duration = Date.now() - startTime;
      console.log(
        `✅ Completed indexing collections for all chains (${duration}ms)`
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
