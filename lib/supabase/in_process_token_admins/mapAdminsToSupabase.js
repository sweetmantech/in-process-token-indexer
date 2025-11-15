/**
 * Maps admin permission events from GRPC to Supabase format for in_process_token_admins table.
 * @param {Array<Object>} adminEvents - Array of admin permission events from GRPC.
 * @param {Map<string, string>} tokenIdMap - Map with key "address-chainId" and value as token id (uuid).
 * @returns {Array<Object>} - The mapped objects for Supabase upsert with token, artist_address, and createdAt.
 */
export function mapAdminsToSupabase(adminEvents, tokenIdMap) {
  return adminEvents
    .map(event => {
      const address = event.tokenContract?.toLowerCase();
      const chainId = event.chainId;
      const key = `${address}-${chainId}`;
      const tokenId = tokenIdMap.get(key);

      // Only include admins where token exists
      if (!tokenId) {
        return null;
      }

      return {
        token: tokenId,
        artist_address: event.user?.toLowerCase(),
        createdAt: new Date(Number(event.blockTimestamp) * 1000).toISOString(),
      };
    })
    .filter(admin => admin !== null); // Filter out null entries where token doesn't exist
}
