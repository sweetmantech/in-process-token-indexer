import { supabase } from '../client.js';

/**
 * Gets token IDs from in_process_tokens table by address and chainId pairs.
 * @param {Array<Object>} tokenPairs - Array of { address: string, chainId: number } objects.
 * @returns {Promise<Map<string, string>>} - Map with key "address-chainId" and value as token id (uuid).
 */
export async function getTokenIdsByAddressAndChainId(tokenPairs) {
  if (!tokenPairs || tokenPairs.length === 0) {
    return new Map();
  }

  // Get unique addresses and normalize to lowercase
  const uniqueAddresses = [
    ...new Set(
      tokenPairs.map(pair => pair.address?.toLowerCase()).filter(Boolean)
    ),
  ];

  if (uniqueAddresses.length === 0) {
    return new Map();
  }

  // Query tokens by addresses
  const { data, error } = await supabase
    .from('in_process_tokens')
    .select('id, address, chainId')
    .in('address', uniqueAddresses);

  if (error) {
    throw new Error(`Failed to get token IDs: ${error.message}`);
  }

  // Create a map of address-chainId -> id
  const tokenIdMap = new Map();

  if (data) {
    data.forEach(token => {
      const key = `${token.address.toLowerCase()}-${token.chainId}`;
      tokenIdMap.set(key, token.id);
    });
  }

  return tokenIdMap;
}
