import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

/**
 * Upserts sales into Supabase.
 * @param sales - Array of sale objects to upsert.
 * @returns Array of upserted sale rows.
 */
export async function upsertSales(
  sales: Array<Database['public']['Tables']['in_process_sales']['Insert']>
): Promise<Array<Database['public']['Tables']['in_process_sales']['Row']>> {
  if (sales.length === 0) {
    console.log('ℹ️  No sales to upsert');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('in_process_sales')
      .upsert(sales, {
        onConflict: 'moment',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Upserted ${data?.length || 0} sale(s)`);
    return data || [];
  } catch (error) {
    console.error(`❌ Failed to upsert sales:`, error);
    throw error;
  }
}
