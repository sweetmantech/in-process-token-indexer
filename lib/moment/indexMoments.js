import { IndexerFactory } from '../IndexerFactory.js';
import { MOMENTS_GRPC_ENDPOINT } from '../const.js';
import { getMaxBlockTimestamp } from '../supabase/in_process_tokens/getMaxBlockTimestamp.js';
/**
 * Indexes moment events from the GRPC endpoint using the factory pattern
 */
async function indexMoments() {
  const momentsIndexer = new IndexerFactory({
    name: 'moments',
    grpcEndpoint: MOMENTS_GRPC_ENDPOINT,
    query: `
      query MyQuery($limit: Int, $offset: Int, $minTimestamp: Int, $chainId: Int) {
        CreatorFactory_SetupNewContract(limit: $limit, offset: $offset, order_by: {blockNumber: desc}, where: {blockTimestamp: {_gt: $minTimestamp}, chainId: {_eq: $chainId}}) {
          id
          chainId
          address
          contractURI
          defaultAdmin
          transactionHash
          blockNumber
          blockTimestamp
        }
      }
    `,
    dataPath: 'CreatorFactory_SetupNewContract',
    pollInterval: 3000,
    getQueryVariables: async () => {
      const maxTimestampsByChain = await getMaxBlockTimestamp();
      const variables = maxTimestampsByChain.map(timestamp => ({
        minTimestamp: timestamp.maxTimestamp,
        chainId: timestamp.chainId,
      }));
      return variables;
    },
    processFunction: async (network, events) => {
      const { processMomentsInBatches } = await import(
        './processMomentsInBatches.js'
      );
      return await processMomentsInBatches(network, events);
    },
  });

  return await momentsIndexer.start();
}

export default indexMoments;
