import { NETWORKS, INDEX_INTERVAL_MS } from '../consts';
import { indexMoments } from '../grpc/InProcess_Moments/indexMoments';
import { padChainId } from '../utils/padChainId';
import { sleep } from '../utils/sleep';

/**
 * Indexes moments in parallel for all configured chains.
 * Runs continuously in a loop.
 */
export async function executeMomentsIndexingParallel(): Promise<void> {
  const chainIds = NETWORKS.map(network => network.id);

  while (true) {
    try {
      const startTime = Date.now();

      await Promise.all(
        chainIds.map(async chainId => {
          try {
            console.log(`🔍 Chain ${padChainId(chainId)}: Indexing moments`);
            const moments = await indexMoments(chainId);
            if (moments.length)
              console.log(
                `📊 Chain ${padChainId(chainId)}: Indexed new ${moments.length} moments`
              );
            else
              console.log(
                `ℹ️  Chain ${padChainId(chainId)}: No new moments found`
              );
          } catch (error) {
            console.error(
              `❌ Chain ${padChainId(chainId)}: Failed to index moments:`,
              error
            );
          }
        })
      );

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

