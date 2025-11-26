import { supabase } from '@/lib/supabase/client';
import { InProcessSale } from '@/types/supabase';

interface SelectSalesOptions {
  order?: { column: string; ascending: boolean };
  limit?: number;
}

/**
 * Queries sales from Supabase with moment data.
 * @param options - Query options including order and limit.
 * @returns Array of sale records with moment data.
 */
export async function selectSales(
  options: SelectSalesOptions = {}
): Promise<InProcessSale[]> {
  const { order, limit } = options;

  let query = supabase
    .from('in_process_sales')
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
    console.error('❌ Failed to select sales:', error);
    throw error;
  }

  return (data as InProcessSale[]) || [];
}
