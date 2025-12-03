import { InProcess_ERC20RewardsDeposit_t } from '@/types/envio';
import { getMomentIdMap } from '@/lib/moments/getMomentIdMap';

/**
 * Gets moment IDs from Supabase for given payment deposits
 * and returns a Map mapping [collection address, chain_id, token_id] triplets to moment IDs.
 * @param deposits - Array of InProcess_ERC20RewardsDeposit_t to query moments for.
 * @returns Map with key as `${collectionAddress}:${chainId}:${tokenId}` and value as moment ID.
 */
export async function getMomentIdMapForPayments(
  deposits: InProcess_ERC20RewardsDeposit_t[]
): Promise<Map<string, string>> {
  return await getMomentIdMap(deposits);
}
