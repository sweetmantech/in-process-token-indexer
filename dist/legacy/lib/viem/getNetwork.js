"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetwork = getNetwork;
const chains_1 = require("viem/chains");
/**
 * Gets the network name from a chainId
 * @param chainId - The chain ID
 * @returns The network name ('base' or 'baseSepolia')
 */
function getNetwork(chainId) {
    if (chainId === chains_1.base.id) {
        return 'base';
    }
    if (chainId === chains_1.baseSepolia.id) {
        return 'baseSepolia';
    }
    // Default to 'base' if chainId doesn't match
    return 'base';
}
