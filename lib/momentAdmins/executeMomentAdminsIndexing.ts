import { INDEX_INTERVAL_MS } from '../consts';
import { indexMomentAdmins } from '../grpc/InProcess_Moment_Admins/indexMomentAdmins';
import { sleep } from '../utils/sleep';

/**
 * Indexes moment admins using granted_at for incremental indexing.
 * Runs continuously in a loop.
 */
export async function executeMomentAdminsIndexing(): Promise<void> {
  while (true) {
    try {
      const startTime = Date.now();

      console.log(`🔍 Indexing moment admins`);

      const admins = await indexMomentAdmins();

      if (admins.length)
        console.log(`📊 Indexed new ${admins.length} moment admins`);
      else console.log(`ℹ️  No new moment admins found`);

      const duration = Date.now() - startTime;
      console.log(`✅ Completed indexing moment admins (${duration}ms)`);

      // Wait before next iteration
      await sleep(INDEX_INTERVAL_MS);
    } catch (error) {
      console.error(`❌ Error in indexing cycle:`, error);
      // Wait before retrying even on error
      await sleep(INDEX_INTERVAL_MS);
    }
  }
}
