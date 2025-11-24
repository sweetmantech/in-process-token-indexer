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
/**
 * Indexes payment events from the GRPC endpoint using the factory pattern
 */
async function indexPayments() {
    const paymentsIndexer = new IndexerFactory_1.IndexerFactory({
        name: 'payments',
        grpcEndpoint: consts_1.GRPC_ENDPOINT,
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
            const variables = consts_1.networks.map(network => ({
                chainId: network.id,
            }));
            return variables;
        },
        processFunction: async (network, events) => {
            const { processPaymentsInBatches } = await Promise.resolve().then(() => __importStar(require('./processPaymentsInBatches.js')));
            return await processPaymentsInBatches(network, events);
        },
    });
    return await paymentsIndexer.start();
}
exports.default = indexPayments;
