import indexLegacyPayments from './legacy/lib/payments/indexPayments.js';
import indexLegacyMoments from './legacy/lib/moment/indexMoments.js';
import indexLegacyAdmins from './legacy/lib/moment/indexAdmins.js';

async function indexAllNetworks(): Promise<void> {
  // Start both the blockchain event indexer and the payments indexer
  const legacyPaymentsIndexer = indexLegacyPayments();
  const legacyMomentsIndexer = indexLegacyMoments();
  const legacyAdminsIndexer = indexLegacyAdmins();

  await Promise.all([
    legacyPaymentsIndexer,
    legacyMomentsIndexer,
    legacyAdminsIndexer,
  ]);
}

indexAllNetworks().catch(console.error);
