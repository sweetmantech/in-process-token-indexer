import indexEventsForNetwork from "./lib/indexEventsForNetwork.js";
import indexPayments from "./lib/payments/indexPayments.js";
import { NETWORKS } from "./lib/rpc.js";

async function indexAllNetworks() {
  // Start both the blockchain event indexer and the payments indexer
  const blockchainIndexers = Object.values(NETWORKS).map(indexEventsForNetwork);
  const paymentsIndexer = indexPayments();

  await Promise.all([...blockchainIndexers, paymentsIndexer]);
}

indexAllNetworks().catch(console.error);
