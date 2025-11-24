import { supabase } from '../client.js';
/**
 * Selects the most recent admin from the in_process_token_admins table for a given chainId.
 * @param chainId - The chain ID to filter by.
 * @param limit - Maximum number of records to return (default: 1).
 * @returns An array of admin objects with token relation, may be empty if none exist.
 */
export async function selectAdmins(chainId, limit = 1) {
    const { data, error } = await supabase
        .from('in_process_token_admins')
        .select('*, token:in_process_tokens!inner(chainId)')
        .eq('token.chainId', chainId)
        .order('createdAt', { ascending: false })
        .limit(limit);
    if (error) {
        throw new Error(`Failed to select admins: ${error.message}`);
    }
    return data || [];
}
//# sourceMappingURL=selectAdmins.js.map