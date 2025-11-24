export interface TokenData {
    address: string;
    chainId: number;
    [key: string]: unknown;
}
/**
 * Upserts multiple token records into the in_process_tokens table.
 * @param tokens - Array of token data objects to upsert.
 * @returns The upserted records or error.
 */
export declare function upsertTokens(tokens: TokenData[]): Promise<unknown[]>;
//# sourceMappingURL=upsertTokens.d.ts.map