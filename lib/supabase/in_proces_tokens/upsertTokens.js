import { supabase } from "../client.js";

/**
 * Upserts multiple token records into the in_process_tokens table.
 * @param {Array<Object>} tokens - Array of token data objects to upsert.
 * @returns {Promise<Object>} - The upserted records or error.
 */
export async function upsertTokens(tokens) {
  const { data, error } = await supabase
    .from("in_process_tokens")
    .upsert(tokens, { onConflict: ["address", "chainId"] })
    .select();

  if (error) {
    throw error;
  }
  return data;
}
