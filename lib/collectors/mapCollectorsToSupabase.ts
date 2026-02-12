import toSupabaseTimestamp from '@/lib/toSupabaseTimestamp';
import { InProcess_Collectors_t } from '@/types/envio';
import { Database } from '@/lib/supabase/types';
import { getMomentIdMap } from '@/lib/moments/getMomentIdMap';

/**
 * Maps Envio InProcess_Collectors_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Resolves collection+chain_id+token_id to moment ID.
 * - Maps collector address to lowercase.
 * - Converts collected_at from chain timestamp to ISO timestamp.
 *
 * @param collectors - Array of InProcess_Collectors_t from Envio.
 * @returns Promise of objects formatted for Supabase upsert.
 */
export async function mapCollectorsToSupabase(
  collectors: InProcess_Collectors_t[]
): Promise<Database['public']['Tables']['in_process_collectors']['Insert'][]> {
  const momentIdMap = await getMomentIdMap(collectors);

  const mappedCollectors = collectors
    .map(collector => {
      const tripletKey = `${collector.collection.toLowerCase()}:${collector.chain_id}:${collector.token_id}`;
      const momentId = momentIdMap.get(tripletKey);
      if (!momentId) {
        return undefined;
      }
      return {
        moment: momentId,
        collector: collector.collector.toLowerCase(),
        amount: collector.amount,
        transaction_hash: collector.transaction_hash.toLowerCase(),
        collected_at: toSupabaseTimestamp(collector.collected_at),
      };
    })
    .filter(collector => collector !== undefined);

  return mappedCollectors;
}
