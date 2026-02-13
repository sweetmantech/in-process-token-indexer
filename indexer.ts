import { executeIndexers } from '@/lib/indexers/executeIndexers';
import { runBot } from '@/lib/bot/start';
import { getBot } from '@/lib/bot/bot';
import { startSocketServer } from '@/lib/socket/server';

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
  startSocketServer();
  await runBot();
  executeIndexers();
}

index().catch(error => {
  console.error('❌ Fatal error in indexer:', error);
  process.exit(1);
});
