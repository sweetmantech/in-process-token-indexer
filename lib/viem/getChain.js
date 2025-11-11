import { base, baseSepolia } from 'viem/chains';

/**
 * Gets the chainId from a network name
 * @param {string} network - The network name ('base' or 'baseSepolia')
 * @returns {number} - The chain ID
 */
export function getChain(chainId) {
  if (chainId === base.id) {
    return base;
  }
  if (chainId === baseSepolia.id) {
    return baseSepolia;
  }
  // Default to base chainId if network doesn't match
  return base;
}
