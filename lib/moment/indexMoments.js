import { IndexerFactory } from "../IndexerFactory.js";
import { MOMENTS_GRPC_ENDPOINT } from "../const.js";

/**
 * Indexes moment events from the GRPC endpoint using the factory pattern
 */
async function indexMoments() {
  const momentsIndexer = new IndexerFactory({
    name: "moments",
    grpcEndpoint: MOMENTS_GRPC_ENDPOINT,
    query: `
      query MyQuery($limit: Int, $offset: Int) {
        CreatorFactory_SetupNewContract(limit: $limit, offset: $offset, order_by: {blockNumber: desc}) {
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
    dataPath: "CreatorFactory_SetupNewContract",
    processFunction: async (network, events) => {
      const { processMomentsInBatches } = await import("./processMomentsInBatches.js");
      return await processMomentsInBatches(network, events);
    }
  });
  
  return await momentsIndexer.start();
}

export default indexMoments;
