import indexPayments from './lib/payments/indexPayments.js';
import indexMoments from './lib/moment/indexMoments.js';

async function indexAllNetworks() {
  // Start both the blockchain event indexer and the payments indexer
  const momentsIndexer = indexMoments();
  const paymentsIndexer = indexPayments();

  await Promise.all([momentsIndexer, paymentsIndexer]);
}

indexAllNetworks().catch(console.error);
