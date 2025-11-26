import indexLegacyPayments from './legacy/lib/payments/indexPayments';
import indexLegacyMoments from './legacy/lib/moment/indexMoments';
import indexLegacyAdmins from './legacy/lib/moment/indexAdmins';
import { executeMomentsIndexing } from './lib/moments/executeMomentsIndexing';
import { executeCollectionsIndexing } from './lib/collections/executeCollectionsIndexing';
import { executeAdminsIndexing } from './lib/admins/executeAdminsIndexing';
import { executeMomentCommentsIndexing } from './lib/momentComments/executeMomentCommentsIndexing';
import { executeSalesIndexing } from './lib/sales/executeSalesIndexing';

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

async function legacyIndex(): Promise<void> {
  // Start all indexers: payments, moments, and admins
  const legacyPaymentsIndexer = indexLegacyPayments();
  const legacyMomentsIndexer = indexLegacyMoments();
  const legacyAdminsIndexer = indexLegacyAdmins();
  await Promise.all([
    legacyPaymentsIndexer,
    legacyMomentsIndexer,
    legacyAdminsIndexer,
  ]);
}

async function index(): Promise<void> {
  await Promise.all([
    executeCollectionsIndexing(),
    executeMomentsIndexing(),
    executeAdminsIndexing(),
    executeMomentCommentsIndexing(),
    executeSalesIndexing(),
  ]);
}

legacyIndex().catch(error => {
  console.error('Fatal error in indexer:', error);
  process.exit(1);
});

index().catch(error => {
  console.error('Fatal error in indexer:', error);
  process.exit(1);
});
