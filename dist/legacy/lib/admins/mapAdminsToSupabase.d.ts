import type { TokenAdminData } from '../supabase/in_process_token_admins/upsertTokenAdmins.js';
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
export declare function mapAdminsToSupabase(adminEvents: AdminEvent[], tokenIdMap: Map<string, string>): TokenAdminData[];
export {};
//# sourceMappingURL=mapAdminsToSupabase.d.ts.map