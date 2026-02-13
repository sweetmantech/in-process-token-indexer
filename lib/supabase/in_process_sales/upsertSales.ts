import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

/**
 * Upserts sales into Supabase.
 * @param sales - Array of sale objects to upsert.
 * @returns Array of upserted sale rows.
 */
export async function upsertSales(
  sales: Array<Database['public']['Tables']['in_process_sales']['Insert']>
): Promise<void> {
  if (sales.length === 0) {
    console.log('ℹ️  No sales to upsert');
    return;
  }

  try {
    const { error } = await supabase.from('in_process_sales').upsert(sales, {
      onConflict: 'moment',
      ignoreDuplicates: false,
    });

    if (error) {
      throw error;
    }

    console.log(`✅ Upserted ${sales.length} sale(s)`);
  } catch (error) {
    console.error(`❌ Failed to upsert sales:`, error);
    throw error;
  }
}
