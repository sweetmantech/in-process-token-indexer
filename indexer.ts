import { momentsIndexer } from '@/lib/indexers/momentsIndexer';
import { collectionsIndexer } from '@/lib/indexers/collectionsIndexer';
import { adminsIndexer } from '@/lib/indexers/adminsIndexer';
import { commentsIndexer } from '@/lib/indexers/commentsIndexer';
import { salesIndexer } from '@/lib/indexers/salesIndexer';
import { paymentsIndexer } from './lib/indexers/paymentsIndexer';

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

async function index(): Promise<void> {
  await Promise.all([
    collectionsIndexer.execute(),
    momentsIndexer.execute(),
    adminsIndexer.execute(),
    commentsIndexer.execute(),
    salesIndexer.execute(),
    paymentsIndexer.execute(),
  ]);
}

index().catch(error => {
  console.error('Fatal error in indexer:', error);
  process.exit(1);
});
