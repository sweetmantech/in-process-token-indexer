import { networks } from '../../const.js';
import { supabase } from '../client.js';

/**
 * Gets the maximum createdAt timestamp from the in_process_tokens table grouped by chainId.
 * @returns {Promise<Object>} - Object with chainId as keys and max timestamp as values, or empty object if no tokens exist.
 */
export async function getMaxBlockTimestamp() {
  const promise = await networks.map(async network => {
    const { data, error } = await supabase
      .from('in_process_tokens')
      .select()
      .eq('chainId', network.id)
      .order('createdAt', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return {
        maxTimestamp: new Date(0).getTime() / 1000,
        chainId: network.id,
      };
    }
    return {
      maxTimestamp: new Date("2025-11-10 14:11:15+00").getTime() / 1000,
      chainId: network.id,
    };
  });

  const maxTimestamps = await Promise.all(promise);

  return maxTimestamps;
}
