import { base, baseSepolia, type Chain } from 'viem/chains';

/**
 * Gets the chain from a chainId
 * @param chainId - The chain ID
 * @returns The chain object
 * @throws Error if chainId is not supported
 */
export function getChainById(chainId: number): Chain {
  if (chainId === base.id) {
    return base;
  }
  if (chainId === baseSepolia.id) {
    return baseSepolia;
  }
  throw new Error(`Unsupported chainId: ${chainId}`);
}
