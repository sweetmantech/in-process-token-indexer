import type { TokenData } from './upsertTokens.js';
interface MomentEvent {
    address?: string;
    defaultAdmin?: string;
    chainId: number;
    contractURI?: string;
    blockTimestamp?: string | number;
    payoutRecipient?: string;
    [key: string]: unknown;
}
/**
 * Maps moment events from GRPC to Supabase format for in_process_tokens table.
 * Filters out moments with missing or invalid address/defaultAdmin to prevent invalid blockchain addresses.
 * @param moments - Array of moment events from GRPC.
 * @returns The mapped objects for Supabase upsert (only valid moments with required fields).
 */
export declare function mapMomentsToSupabase(moments: MomentEvent[]): TokenData[];
export {};
//# sourceMappingURL=mapMomentsToSupabase.d.ts.map