import indexLegacyPayments from './legacy/lib/payments/indexPayments.js';
import indexLegacyMoments from './legacy/lib/moment/indexMoments.js';
import indexLegacyAdmins from './legacy/lib/moment/indexAdmins.js';

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

async function indexAllNetworks(): Promise<void> {
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

indexAllNetworks().catch(error => {
  console.error('Fatal error in indexer:', error);
  process.exit(1);
});
