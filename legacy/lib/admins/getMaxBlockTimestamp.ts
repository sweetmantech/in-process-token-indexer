import { networks } from '../consts';
import { selectAdmins } from '../supabase/in_process_token_admins/selectAdmins';

interface MaxTimestampResult {
  maxTimestamp: number;
  chainId: number;
}

interface AdminRecord {
  createdAt: string;
  [key: string]: unknown;
}

/**
 * Gets the maximum createdAt timestamp from the in_process_token_admins table grouped by chainId.
 * @returns Array of objects with chainId and maxTimestamp properties.
 */
export async function getMaxBlockTimestamp(): Promise<MaxTimestampResult[]> {
  const promises = networks.map(async network => {
    const admins = (await selectAdmins(network.id)) as AdminRecord[];

    if (!admins || admins.length === 0) {
      return {
        maxTimestamp: Math.floor(new Date(0).getTime() / 1000),
        chainId: network.id,
      };
    }

    return {
      maxTimestamp: Math.floor(new Date(admins[0].createdAt).getTime() / 1000),
      chainId: network.id,
    };
  });

  const maxTimestamps = await Promise.all(promises);

  return maxTimestamps;
}
