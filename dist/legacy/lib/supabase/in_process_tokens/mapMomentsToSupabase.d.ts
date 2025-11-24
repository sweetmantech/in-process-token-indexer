interface MomentEvent {
    address?: string;
    defaultAdmin?: string;
    chainId: number;
    contractURI?: string;
    blockTimestamp?: string | number;
    payoutRecipient?: string;
    [key: string]: unknown;
}
interface SupabaseTokenData {
    address: string;
    defaultAdmin: string;
    chainId: number;
    tokenId: number;
    uri?: string;
    createdAt: string;
    payoutRecipient?: string;
}
/**
 * Maps moment events from GRPC to Supabase format for in_process_tokens table.
 * @param moments - Array of moment events from GRPC.
 * @returns The mapped objects for Supabase upsert.
 */
export declare function mapMomentsToSupabase(moments: MomentEvent[]): SupabaseTokenData[];
export {};
//# sourceMappingURL=mapMomentsToSupabase.d.ts.map