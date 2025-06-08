/**
 * Maps a decoded log and block to a Supabase upsert object for in_process_tokens.
 * @param {Object} log - The decoded log object.
 * @param {Object} block - The block object (must include timestamp).
 * @param {string} network - The network name (e.g., 'base' or 'baseSepolia').
 * @returns {Object} - The mapped object for Supabase upsert.
 */
export function mapLogToSupabase(log, block, network) {
  return {
    address: log.args.newContract,
    defaultAdmin: log.args.creator,
    chainId: network === "base" ? 8453 : 84532,
    tokenId: 0,
    uri: log.args.contractURI,
    createdAt: new Date(Number(block.timestamp) * 1000).toISOString(),
  };
}
