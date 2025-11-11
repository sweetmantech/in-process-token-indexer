import { base, baseSepolia } from 'viem/chains';

/**
 * Gets the network name from a chainId
 * @param {number} chainId - The chain ID
 * @returns {string} - The network name ('base' or 'baseSepolia')
 */
export function getNetwork(chainId) {
  if (chainId === base.id) {
    return 'base';
  }
  if (chainId === baseSepolia.id) {
    return 'baseSepolia';
  }
  // Default to 'base' if chainId doesn't match
  return 'base';
}
