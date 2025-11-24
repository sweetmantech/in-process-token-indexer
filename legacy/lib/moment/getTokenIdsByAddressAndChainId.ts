import { selectTokens } from '../supabase/in_process_tokens/selectTokens.js';
import { validateTokenRecords } from './validateTokenRecords.js';

interface TokenPair {
  address: string;
  chainId: number;
}

/**
 * Gets token IDs from in_process_tokens table by address and chainId pairs.
 * @param tokenPairs - Array of { address: string, chainId: number } objects.
 * @returns Map with key "address-chainId" and value as token id (uuid).
 */
export async function getTokenIdsByAddressAndChainId(
  tokenPairs: TokenPair[]
): Promise<Map<string, string>> {
  if (!tokenPairs || tokenPairs.length === 0) {
    return new Map();
  }

  // Get unique addresses and normalize to lowercase
  const uniqueAddresses = [
    ...new Set(
      tokenPairs
        .map(pair => pair.address?.toLowerCase())
        .filter(Boolean) as string[]
    ),
  ];

  if (uniqueAddresses.length === 0) {
    return new Map();
  }

  // Query tokens by addresses
  const rawData = await selectTokens({
    addresses: uniqueAddresses,
    fields: 'id, address, chainId',
  });

  // Validate and filter the returned data
  const data = validateTokenRecords(rawData);

  // Create a map of address-chainId -> id
  const tokenIdMap = new Map<string, string>();

  if (data) {
    data.forEach(token => {
      const key = `${token.address.toLowerCase()}-${token.chainId}`;
      tokenIdMap.set(key, token.id);
    });
  }

  return tokenIdMap;
}
