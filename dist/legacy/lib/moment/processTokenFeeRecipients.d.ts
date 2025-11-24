import type { UpsertedToken } from '../supabase/in_process_tokens/upsertTokens.js';
/**
 * Processes token fee recipients for tokens with payout recipients (split or non-split).
 * @param network - The network name (for logging purposes)
 * @param upsertedTokens - Tokens returned from upsertTokens, including payoutRecipient and chainId.
 */
export declare function processTokenFeeRecipients(network: string, upsertedTokens: UpsertedToken[]): Promise<void>;
//# sourceMappingURL=processTokenFeeRecipients.d.ts.map