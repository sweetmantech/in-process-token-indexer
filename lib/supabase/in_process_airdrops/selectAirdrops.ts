import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

interface SelectAirdropsOptions {
  order?: { column: string; ascending: boolean };
  limit?: number;
}

/**
 * Queries airdrops from Supabase with moment data.
 * @param options - Query options including order and limit.
 * @returns Array of airdrop records with moment data.
 */
export async function selectAirdrops(
  options: SelectAirdropsOptions = {}
): Promise<Array<Database['public']['Tables']['in_process_airdrops']['Row']>> {
  const { order, limit } = options;

  let query = supabase
    .from('in_process_airdrops')
    .select('*, moment:in_process_moments!inner(*)');

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
    console.error('❌ Failed to select airdrops:', error);
    throw error;
  }

  return data || [];
}
