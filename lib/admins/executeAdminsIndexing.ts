import { INDEX_INTERVAL_MS } from '@/lib/consts';
import { indexAdmins } from '@/lib/grpc/InProcess_Admins/indexAdmins';
import { sleep } from '@/lib/sleep';

/**
 * Indexes admins using granted_at for incremental indexing.
 * Runs continuously in a loop.
 */
export async function executeAdminsIndexing(): Promise<void> {
  while (true) {
    try {
      const startTime = Date.now();

      console.log(`🔍 Indexing admins`);

      const admins = await indexAdmins();

      if (admins.length) console.log(`📊 Indexed new ${admins.length} admins`);
      else console.log(`ℹ️  No new admins found`);

      const duration = Date.now() - startTime;
      console.log(`✅ Completed indexing admins (${duration}ms)`);

      // Wait before next iteration
      await sleep(INDEX_INTERVAL_MS);
    } catch (error) {
      console.error(`❌ Error in indexing cycle:`, error);
      // Wait before retrying even on error
      await sleep(INDEX_INTERVAL_MS);
    }
  }
}
