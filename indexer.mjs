import indexEventsForNetwork from "./lib/indexEventsForNetwork.js";
import indexPayments from "./lib/indexPayments.js";
import { NETWORKS } from "./lib/rpc.js";

async function indexAllNetworks() {
  // Start both the blockchain event indexer and the payments indexer
  // const blockchainIndexers = Object.values(NETWORKS).map(indexEventsForNetwork);
  const paymentsIndexer = indexPayments("base"); // Using base as the network name for payments

  await Promise.all([paymentsIndexer]);
}

indexAllNetworks().catch(console.error);
