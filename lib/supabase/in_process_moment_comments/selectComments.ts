import { supabase } from '@/lib/supabase/client';
import { InProcessMomentComment } from '@/types/supabase';

interface SelectCommentsOptions {
  order?: { column: string; ascending: boolean };
  limit?: number;
}

/**
 * Queries moment comments from Supabase with moment data.
 * @param options - Query options including order and limit.
 * @returns Array of comment records with moment data.
 */
export async function selectComments(
  options: SelectCommentsOptions = {}
): Promise<InProcessMomentComment[]> {
  const { order, limit } = options;

  let query = supabase
    .from('in_process_moment_comments')
    .select('*, moment:in_process_moments!inner(id, collection, token_id)');

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
    console.error('❌ Failed to select comments:', error);
    throw error;
  }

  return (data as InProcessMomentComment[]) || [];
}
