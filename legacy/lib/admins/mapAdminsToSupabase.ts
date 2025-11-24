import type { TokenAdminData } from '../supabase/in_process_token_admins/upsertTokenAdmins.js';
import { safeTimestampToISO } from '../supabase/safeTimestampToISO.js';

interface AdminEvent {
  tokenContract?: string;
  chainId: number;
  user?: string;
  blockTimestamp?: string | number;
  [key: string]: unknown;
}

/**
 * Maps admin permission events from GRPC to Supabase format for in_process_token_admins table.
 * @param adminEvents - Array of admin permission events from GRPC.
 * @param tokenIdMap - Map with key "address-chainId" and value as token id (uuid).
 * @returns The mapped objects for Supabase upsert with token, artist_address, and createdAt.
 */
export function mapAdminsToSupabase(
  adminEvents: AdminEvent[],
  tokenIdMap: Map<string, string>
): TokenAdminData[] {
  const result: TokenAdminData[] = [];

  for (const event of adminEvents) {
    const address = event.tokenContract?.toLowerCase();
    const chainId = event.chainId;
    const key = `${address}-${chainId}`;
    const tokenId = tokenIdMap.get(key);

    // Only include admins where token exists
    if (tokenId) {
      result.push({
        token: tokenId,
        artist_address: event.user?.toLowerCase() || '',
        createdAt: safeTimestampToISO(event.blockTimestamp),
      });
    }
  }

  return result;
}
