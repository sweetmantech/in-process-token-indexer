import { supabase } from '../client.js';

/**
 * Selects the most recent admin from the in_process_token_admins table for a given chainId.
 * @param {number} chainId - The chain ID to filter by.
 * @returns {Promise<Object|null>} - The most recent admin object with token relation, or null if none exists.
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

  return data;
}
