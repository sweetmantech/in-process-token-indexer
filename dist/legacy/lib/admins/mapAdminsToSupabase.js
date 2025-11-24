"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapAdminsToSupabase = mapAdminsToSupabase;
const safeTimestampToISO_1 = require("../supabase/safeTimestampToISO");
/**
 * Maps admin permission events from GRPC to Supabase format for in_process_token_admins table.
 * @param adminEvents - Array of admin permission events from GRPC.
 * @param tokenIdMap - Map with key "address-chainId" and value as token id (uuid).
 * @returns The mapped objects for Supabase upsert with token, artist_address, and createdAt.
 */
function mapAdminsToSupabase(adminEvents, tokenIdMap) {
    const result = [];
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
                createdAt: (0, safeTimestampToISO_1.safeTimestampToISO)(event.blockTimestamp),
            });
        }
    }
    return result;
}
