export interface TokenData {
    address: string;
    defaultAdmin: string;
    chainId: number;
    tokenId: number;
    uri?: string;
    createdAt: string;
    payoutRecipient?: string;
    [key: string]: unknown;
}
export interface UpsertedToken {
    id: string;
    address: string;
    defaultAdmin: string;
    chainId: number;
    tokenId: number;
    uri?: string;
    createdAt: string;
    payoutRecipient?: string | null;
    hidden?: boolean;
    [key: string]: unknown;
}
/**
 * Upserts multiple token records into the in_process_tokens table.
 * @param tokens - Array of token data objects to upsert.
 * @returns The upserted records or error.
 */
export declare function upsertTokens(tokens: TokenData[]): Promise<UpsertedToken[]>;
//# sourceMappingURL=upsertTokens.d.ts.map