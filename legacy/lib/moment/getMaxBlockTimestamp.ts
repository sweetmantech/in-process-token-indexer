import { networks } from '../consts';
import { selectTokens } from '../supabase/in_process_tokens/selectTokens';

interface MaxTimestampResult {
  maxTimestamp: number;
  chainId: number;
}

interface TokenRecord {
  createdAt: string;
  [key: string]: unknown;
}

/**
 * Gets the maximum createdAt timestamp from the in_process_tokens table grouped by chainId.
 * @returns Array of objects with chainId and maxTimestamp properties.
 */
export async function getMaxBlockTimestamp(): Promise<MaxTimestampResult[]> {
  const promises = networks.map(async network => {
    const tokens = (await selectTokens({
      chainId: network.id,
      limit: 1,
      orderBy: { field: 'createdAt', ascending: false },
    })) as TokenRecord[];

    if (!tokens || tokens.length === 0) {
      return {
        maxTimestamp: Math.floor(new Date(0).getTime() / 1000),
        chainId: network.id,
      };
    }

    return {
      maxTimestamp: Math.floor(new Date(tokens[0].createdAt).getTime() / 1000),
      chainId: network.id,
    };
  });

  const maxTimestamps = await Promise.all(promises);

  return maxTimestamps;
}
