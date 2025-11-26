import { supabase } from '@/lib/supabase/client';
import { InProcessMoment } from '@/types/supabase';

interface SelectMomentsOptions {
  collectionAddresses?: string[];
  tokenIds?: number[];
  order?: { column: string; ascending: boolean };
  limit?: number;
}

/**
 * Queries moments from Supabase.
 * @param options - Query options including collectionAddresses, tokenIds, order, and limit.
 * @returns Array of moment records. If collectionAddresses and tokenIds are provided, returns moments with collection data.
 */
export async function selectMoments(
  options: SelectMomentsOptions = {}
): Promise<InProcessMoment[]> {
  const { collectionAddresses = [], tokenIds = [], order, limit } = options;

  let query = supabase
    .from('in_process_moments')
    .select('*, collection:in_process_collections!inner(*)');
  // If collectionAddresses and tokenIds are provided, use the join query
  if (collectionAddresses.length > 0) {
    query = query.in('collection.address', collectionAddresses);
  }

  if (tokenIds.length > 0) {
    query = query.in('token_id', tokenIds);
  }

  if (order) {
    query = query.order(order.column, {
      ascending: order.ascending,
    });
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Failed to select moments:', error);
    throw error;
  }

  return (data as InProcessMoment[]) || [];
}
