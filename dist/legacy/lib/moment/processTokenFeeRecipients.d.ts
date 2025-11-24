interface TokenWithRecipient {
    id: string;
    payoutRecipient?: string;
    chainId: number;
    [key: string]: unknown;
}
/**
 * Processes token fee recipients for tokens with payout recipients (split or non-split).
 * @param network - The network name (for logging purposes)
 * @param upsertedTokens - Tokens returned from upsertTokens, including payoutRecipient and chainId.
 */
export declare function processTokenFeeRecipients(network: string, upsertedTokens: TokenWithRecipient[]): Promise<void>;
export {};
//# sourceMappingURL=processTokenFeeRecipients.d.ts.map