"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChain = getChain;
const chains_1 = require("viem/chains");
/**
 * Gets the chain from a chainId
 * @param chainId - The chain ID
 * @returns The chain object
 * @throws Error if chainId is not supported
 */
function getChain(chainId) {
    if (chainId === chains_1.base.id) {
        return chains_1.base;
    }
    if (chainId === chains_1.baseSepolia.id) {
        return chains_1.baseSepolia;
    }
    throw new Error(`Unsupported chainId: ${chainId}`);
}
