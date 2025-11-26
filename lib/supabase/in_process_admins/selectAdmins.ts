import { supabase } from '@/lib/supabase/client';
import { InProcessAdmin } from '@/types/supabase';

interface SelectAdminsOptions {
  order?: { column: string; ascending: boolean };
  limit?: number;
}

/**
 * Queries admins from Supabase with collection data.
 * @param options - Query options including collectionAddresses, tokenIds, artistAddresses, order, and limit.
 * @returns Array of admin records with collection data.
 */
export async function selectAdmins(
  options: SelectAdminsOptions = {}
): Promise<InProcessAdmin[]> {
  const { order, limit } = options;

  let query = supabase
    .from('in_process_admins')
    .select(
      '*, collection:in_process_collections!inner(id, address, chain_id)'
    );

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
    console.error('❌ Failed to select admins:', error);
    throw error;
  }

  return (data as InProcessAdmin[]) || [];
}
