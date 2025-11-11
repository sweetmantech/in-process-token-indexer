import { base } from 'viem/chains';
import { IndexerFactory } from '../IndexerFactory.js';
import { GRPC_ENDPOINT } from '../const.js';

/**
 * Indexes payment events from the GRPC endpoint using the factory pattern
 */
async function indexPayments() {
  const paymentsIndexer = new IndexerFactory({
    name: 'payments',
    grpcEndpoint: GRPC_ENDPOINT,
    query: `
      query MyQuery($limit: Int, $offset: Int) {
        ERC20Minter_ERC20RewardsDeposit(limit: $limit, offset: $offset, order_by: {blockNumber: desc}) {
          amount
          blockNumber
          collection
          currency
          id
          recipient
          transactionHash
          spender
        }
      }
    `,
    dataPath: 'ERC20Minter_ERC20RewardsDeposit',
    processFunction: async (network, events) => {
      const { processPaymentsInBatches } = await import(
        './processPaymentsInBatches.js'
      );
      return await processPaymentsInBatches(network, events);
    },
    network: 'base',
  });

  return await paymentsIndexer.start();
}

export default indexPayments;
