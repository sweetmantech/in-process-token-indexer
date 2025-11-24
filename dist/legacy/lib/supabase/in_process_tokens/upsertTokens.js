import { supabase } from '../client.js';
/**
 * Upserts multiple token records into the in_process_tokens table.
 * @param tokens - Array of token data objects to upsert.
 * @returns The upserted records or error.
 */
export async function upsertTokens(tokens) {
    // Remove duplicates based on conflict columns (address and chainId)
    const uniqueTokens = tokens.filter((token, index, self) => index ===
        self.findIndex(t => t.address === token.address && t.chainId === token.chainId));
    // Log deduplication info if there were duplicates
    if (uniqueTokens.length < tokens.length) {
        console.log(`Deduplicated tokens: ${tokens.length} -> ${uniqueTokens.length} (removed ${tokens.length - uniqueTokens.length} duplicates)`);
    }
    const { data, error } = await supabase
        .from('in_process_tokens')
        .upsert(uniqueTokens, { onConflict: 'address, chainId' })
        .select();
    if (error) {
        throw error;
    }
    return data || [];
}
//# sourceMappingURL=upsertTokens.js.map