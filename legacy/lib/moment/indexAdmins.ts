import { IndexerFactory } from '../IndexerFactory';
import { GRPC_ENDPOINT } from '../consts';
import { getMaxBlockTimestamp } from '../admins/getMaxBlockTimestamp';

interface AdminEvent {
  tokenContract?: string;
  chainId: number;
  user?: string;
  blockTimestamp?: string | number;
  [key: string]: unknown;
}

/**
 * Indexes admin permission events from the GRPC endpoint using the factory pattern
 */
async function indexAdmins(): Promise<never> {
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
      const { processAdminsInBatches } = await import(
        './processAdminsInBatches.js'
      );
      return await processAdminsInBatches(network, events as AdminEvent[]);
    },
  });

  return await adminsIndexer.start();
}

export default indexAdmins;
