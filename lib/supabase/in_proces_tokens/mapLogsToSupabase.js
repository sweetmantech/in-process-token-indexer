/**
 * Maps an array of decoded logs and a block to an array of Supabase upsert objects for in_process_tokens.
 * @param {Array<Object>} logs - The array of decoded log objects.
 * @param {Object} block - The block object (must include timestamp).
 * @param {string} network - The network name (e.g., 'base' or 'baseSepolia').
 * @returns {Array<Object>} - The mapped objects for Supabase upsert.
 */
export function mapLogsToSupabase(logs, block, network) {
  return logs.map((log) => ({
    address: log.args.newContract,
    defaultAdmin: log.args.creator,
    chainId: network === "base" ? 8453 : 84532,
    tokenId: 0,
    uri: log.args.contractURI,
    createdAt: new Date(Number(block.timestamp) * 1000).toISOString(),
  }));
}
