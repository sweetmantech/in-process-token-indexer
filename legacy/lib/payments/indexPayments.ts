import { IndexerFactory } from '../IndexerFactory.js';
import { GRPC_ENDPOINT, networks } from '../const.js';

interface PaymentEvent {
  transactionHash?: string;
  spender?: string;
  amount?: string;
  blockNumber?: string;
  collection?: string;
  currency?: string;
  [key: string]: unknown;
}

/**
 * Indexes payment events from the GRPC endpoint using the factory pattern
 */
async function indexPayments(): Promise<never> {
  const paymentsIndexer = new IndexerFactory({
    name: 'payments',
    grpcEndpoint: GRPC_ENDPOINT,
    query: `
      query MyQuery($limit: Int, $offset: Int, $chainId: Int) {
        ERC20Minter_ERC20RewardsDeposit(limit: $limit, offset: $offset, order_by: {blockNumber: desc}, where: {chainId: {_eq: $chainId}}) {
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
    getQueryVariables: async () => {
      const variables = networks.map(network => ({
        chainId: network.id,
      }));
      return variables;
    },
    processFunction: async (network, events) => {
      const { processPaymentsInBatches } = await import(
        './processPaymentsInBatches.js'
      );
      return await processPaymentsInBatches(network, events as PaymentEvent[]);
    },
  });

  return await paymentsIndexer.start();
}

export default indexPayments;
