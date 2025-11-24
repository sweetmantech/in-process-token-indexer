"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const IndexerFactory_1 = require("../IndexerFactory");
const consts_1 = require("../consts");
const getMaxBlockTimestamp_1 = require("../admins/getMaxBlockTimestamp");
/**
 * Indexes admin permission events from the GRPC endpoint using the factory pattern
 */
async function indexAdmins() {
    const adminsIndexer = new IndexerFactory_1.IndexerFactory({
        name: 'admins',
        grpcEndpoint: consts_1.GRPC_ENDPOINT,
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
            const maxTimestampsByChain = await (0, getMaxBlockTimestamp_1.getMaxBlockTimestamp)();
            const variables = maxTimestampsByChain.map(timestamp => ({
                minTimestamp: timestamp.maxTimestamp,
                chainId: timestamp.chainId,
            }));
            return variables;
        },
        processFunction: async (network, events) => {
            const { processAdminsInBatches } = await Promise.resolve().then(() => __importStar(require('./processAdminsInBatches.js')));
            return await processAdminsInBatches(network, events);
        },
    });
    return await adminsIndexer.start();
}
exports.default = indexAdmins;
