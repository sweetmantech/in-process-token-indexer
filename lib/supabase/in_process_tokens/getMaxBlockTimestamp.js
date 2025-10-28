import { supabase } from "../client.js";

/**
 * Gets the maximum blockNumber from the in_process_tokens table.
 * @returns {Promise<number|null>} - The maximum blockNumber or null if no tokens exist.
 */
export async function getMaxBlockTimestamp() {
    const { data, error } = await supabase
      .from("in_process_tokens")
      .select("createdAt")
      .order("createdAt", { ascending: false })
      .limit(1);
  
    if (error) {
      throw new Error(`Failed to get max block number: ${error.message}`);
    }
  
    return data && data.length > 0 ? new Date(data[0].createdAt).getTime() : null;
  }
  