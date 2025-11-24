import { IndexerFactory } from '../IndexerFactory.js';
import { GRPC_ENDPOINT } from '../const.js';
import { getMaxBlockTimestamp } from '../admins/getMaxBlockTimestamp.js';
/**
 * Indexes admin permission events from the GRPC endpoint using the factory pattern
 */
async function indexAdmins() {
    const adminsIndexer = new IndexerFactory({
        name: 'admins',
        grpcEndpoint: GRPC_ENDPOINT,
        query: `
      query MyQuery($limit: Int, $offset: Int, $minTimestamp: Int, $chainId: Int) {
        ERC1155_UpdatedPermissions (limit: $limit, offset: $offset, order_by: {blockTimestamp: desc}, where: {blockTimestamp: {_gt: $minTimestamp}, chainId: {_eq: $chainId}}) {
          id  
          chainId
          permissions
          tokenContract
          user
          tokenId
          blockTimestamp
        }
      }
    `,
        dataPath: 'ERC1155_UpdatedPermissions',
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
            const { processAdminsInBatches } = await import('./processAdminsInBatches.js');
            return await processAdminsInBatches(network, events);
        },
    });
    return await adminsIndexer.start();
}
export default indexAdmins;
//# sourceMappingURL=indexAdmins.js.map