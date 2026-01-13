import toSupabaseTimestamp from '@/lib/toSupabaseTimestamp';
import { InProcess_Airdrops_t } from '@/types/envio';
import { Database } from '@/lib/supabase/types';
import { getMomentIdMap } from '@/lib/moments/getMomentIdMap';

/**
 * Maps Envio InProcess_Airdrops_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Resolves collection+chain_id+token_id to moment ID.
 * - Maps recipient address to recipient.
 * - Converts updated_at from chain timestamp to ISO timestamp.
 *
 * @param airdrops - Array of InProcess_Airdrops_t from Envio.
 * @returns Promise of objects formatted for Supabase upsert.
 */
export async function mapAirdropsToSupabase(
  airdrops: InProcess_Airdrops_t[]
): Promise<Database['public']['Tables']['in_process_airdrops']['Insert'][]> {
  const momentIdMap = await getMomentIdMap(airdrops);

  const mappedAirdrops = airdrops
    .map(airdrop => {
      const tripletKey = `${airdrop.collection.toLowerCase()}:${airdrop.chain_id}:${airdrop.token_id}`;
      const momentId = momentIdMap.get(tripletKey);
      if (!momentId) {
        return undefined;
      }
      return {
        moment: momentId,
        recipient: airdrop.recipient.toLowerCase(),
        amount: airdrop.amount,
        updated_at: toSupabaseTimestamp(airdrop.updated_at),
      };
    })
    .filter(airdrop => airdrop !== undefined);

  return mappedAirdrops;
}
