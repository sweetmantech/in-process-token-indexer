import { networks } from '../../const.js';
import { supabase } from '../client.js';

/**
 * Gets the maximum createdAt timestamp from the in_process_tokens table grouped by chainId.
 * @returns {Promise<Object>} - Object with chainId as keys and max timestamp as values, or empty object if no tokens exist.
 */
export async function getMaxBlockTimestamp() {
  const promises = networks.map(async network => {
    const { data, error } = await supabase
      .from('in_process_token_admins')
      .select('*, token:in_process_tokens!inner(chainId)')
      .eq('token.chainId', network.id)
      .order('createdAt', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return {
        maxTimestamp: Math.floor(new Date(0).getTime() / 1000),
        chainId: network.id,
      };
    }
    return {
      maxTimestamp: Math.floor(new Date(data[0].createdAt).getTime() / 1000),
      chainId: network.id,
    };
  });

  const maxTimestamps = await Promise.all(promises);

  return maxTimestamps;
}
