import { IndexerFactory } from '../IndexerFactory.js';
import { GRPC_ENDPOINT } from '../consts.js';
import { getMaxBlockTimestamp } from './getMaxBlockTimestamp.js';
/**
 * Indexes moment events from the GRPC endpoint using the factory pattern
 */
async function indexMoments() {
    const momentsIndexer = new IndexerFactory({
        name: 'moments',
        grpcEndpoint: GRPC_ENDPOINT,
        query: `
      query MyQuery($limit: Int, $offset: Int, $minTimestamp: Int, $chainId: Int) {
        CreatorFactory_SetupNewContract(limit: $limit, offset: $offset, order_by: {blockNumber: desc}, where: {blockTimestamp: {_gt: $minTimestamp}, chainId: {_eq: $chainId}}) {
          id
          chainId
          address
          contractURI
          defaultAdmin
          payoutRecipient
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
            const { processMomentsInBatches } = await import('./processMomentsInBatches.js');
            return await processMomentsInBatches(network, events);
        },
    });
    return await momentsIndexer.start();
}
export default indexMoments;
//# sourceMappingURL=indexMoments.js.map