import indexPayments from './lib/payments/indexPayments.js';
import indexMoments from './lib/moment/indexMoments.js';
import indexAdmins from './lib/moment/indexAdmins.js';

async function indexAllNetworks() {
  // Start both the blockchain event indexer and the payments indexer
  const momentsIndexer = indexMoments();
  const adminsIndexer = indexAdmins();
  const paymentsIndexer = indexPayments();

  await Promise.all([momentsIndexer, adminsIndexer, paymentsIndexer]);
}

indexAllNetworks().catch(console.error);
