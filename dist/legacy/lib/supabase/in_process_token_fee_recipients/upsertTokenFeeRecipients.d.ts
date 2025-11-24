export interface TokenFeeRecipientData {
    token: string;
    artist_address: string;
    percentAllocation?: number;
    [key: string]: unknown;
}
/**
 * Upserts multiple token fee recipient records into the in_process_token_fee_recipients table.
 * @param tokenFeeRecipients - Array of token fee recipient data objects to upsert.
 * Each object should have: { token: string, artist_address: string, percentAllocation?: number }
 * @returns The upserted records or error.
 */
export declare function upsertTokenFeeRecipients(tokenFeeRecipients: TokenFeeRecipientData[]): Promise<unknown[]>;
//# sourceMappingURL=upsertTokenFeeRecipients.d.ts.map