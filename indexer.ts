import { momentsIndexer } from '@/lib/indexers/momentsIndexer';
import { collectionsIndexer } from '@/lib/indexers/collectionsIndexer';
import { adminsIndexer } from '@/lib/indexers/adminsIndexer';
import { commentsIndexer } from '@/lib/indexers/commentsIndexer';
import { salesIndexer } from '@/lib/indexers/salesIndexer';
import { paymentsIndexer } from '@/lib/indexers/paymentsIndexer';
import { airdropsIndexer } from '@/lib/indexers/airdropsIndexer';
import { runBot } from '@/lib/bot/start';
import { getBot } from '@/lib/bot/bot';

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  const bot = getBot();
  if (bot) {
    try {
      await bot.stopPolling();
    } catch (error) {
      console.log('⚠️ Error stopping bot polling:', error);
    }
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  const bot = getBot();
  if (bot) {
    try {
      await bot.stopPolling();
    } catch (error) {
      console.log('⚠️ Error stopping bot polling:', error);
    }
  }
  process.exit(0);
});

async function index(): Promise<void> {
  await runBot();

  // await Promise.all([
  //   collectionsIndexer.execute(),
  //   momentsIndexer.execute(),
  //   adminsIndexer.execute(),
  //   commentsIndexer.execute(),
  //   salesIndexer.execute(),
  //   paymentsIndexer.execute(),
  //   airdropsIndexer.execute(),
  // ]);
}

index().catch(error => {
  console.error('❌ Fatal error in indexer:', error);
  process.exit(1);
});
