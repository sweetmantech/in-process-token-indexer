import { base, baseSepolia } from 'viem/chains';
/**
 * Gets the chain from a chainId
 * @param chainId - The chain ID
 * @returns The chain object
 */
export function getChain(chainId) {
    if (chainId === base.id) {
        return base;
    }
    if (chainId === baseSepolia.id) {
        return baseSepolia;
    }
    // Default to base chain if chainId doesn't match
    return base;
}
//# sourceMappingURL=getChain.js.map