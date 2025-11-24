import { selectTokens } from '../supabase/in_process_tokens/selectTokens.js';

interface TokenPair {
  address: string;
  chainId: number;
}

interface TokenRecord {
  id: string;
  address: string;
  chainId: number;
  [key: string]: unknown;
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
  const data = (await selectTokens({
    addresses: uniqueAddresses,
    fields: 'id, address, chainId',
  })) as TokenRecord[];

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
