import { base, baseSepolia, type Chain } from 'viem/chains';

/**
 * Gets the chain from a chainId
 * @param chainId - The chain ID
 * @returns The chain object
 */
export function getChain(chainId: number): Chain {
  if (chainId === base.id) {
    return base;
  }
  if (chainId === baseSepolia.id) {
    return baseSepolia;
  }
  // Default to base chain if chainId doesn't match
  return base;
}
