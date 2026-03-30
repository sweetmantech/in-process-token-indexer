import toSupabaseTimestamp from '@/lib/toSupabaseTimestamp';
import {
  Catalog_Moments_t,
  InProcess_Moments_t,
  Sound_Moments_t,
} from '@/types/envio';
import { Database } from '@/lib/supabase/types';
import { getCollectionIdMap } from '@/lib/collections/getCollectionIdMap';

export async function mapMomentsToSupabase(
  moments: InProcess_Moments_t[] | Catalog_Moments_t[] | Sound_Moments_t[]
): Promise<
  Array<Database['public']['Tables']['in_process_moments']['Insert']>
> {
  const collectionPairs: Array<[string, number]> = moments.map(
    moment => [moment.collection, moment.chain_id] as [string, number]
  );
  const collectionIdMap = await getCollectionIdMap(collectionPairs);

  const mappedMoments = moments
    .map(moment => {
      const collectionId = collectionIdMap.get(
        `${moment.collection}:${moment.chain_id}`
      );
      if (!collectionId) {
        return undefined;
      }
      return {
        collection: collectionId,
        token_id: Number(moment.token_id),
        uri: moment.uri,
        max_supply: 'max_supply' in moment ? Number(moment.max_supply) : 0,
        created_at: toSupabaseTimestamp(moment.created_at)!,
        updated_at: toSupabaseTimestamp(moment.updated_at)!,
      };
    })
    .filter(moment => moment !== undefined);

  return mappedMoments;
}
