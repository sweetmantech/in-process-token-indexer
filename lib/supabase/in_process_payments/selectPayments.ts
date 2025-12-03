import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';

type InProcessPayment =
  Database['public']['Tables']['in_process_payments']['Row'];

interface SelectPaymentsOptions {
  order?: { column: string; ascending: boolean };
  limit?: number;
}

/**
 * Queries payments from Supabase.
 * @param options - Query options including order and limit.
 * @returns Array of payment records.
 */
export async function selectPayments(
  options: SelectPaymentsOptions = {}
): Promise<InProcessPayment[]> {
  const { order, limit } = options;

  let query = supabase.from('in_process_payments').select('*');

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
    console.error('❌ Failed to select payments:', error);
    throw error;
  }

  return (data as InProcessPayment[]) || [];
}
