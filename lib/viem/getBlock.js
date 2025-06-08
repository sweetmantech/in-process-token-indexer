/**
 * Fetches a block by block number using the provided public client.
 * @param {Object} publicClient - The viem public client instance.
 * @param {bigint|number|string} blockNumber - The block number to fetch.
 * @returns {Promise<Object>} - The block object.
 */
export async function getBlock(network, blockNumber) {
  const publicClient = getPublicClient(network);
  return await publicClient.getBlock({ blockNumber });
}
