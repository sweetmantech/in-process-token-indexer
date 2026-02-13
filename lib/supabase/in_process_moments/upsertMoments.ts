import { Database } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase/client';

/**
 * Upserts multiple moment records into the in_process_moments table.
 * - Uses collection and token_id as conflict resolution columns.
 * - Returns the upserted records.
 *
 * @param moments - Array of moment data objects to upsert (already mapped to Supabase format).
 * @returns The upserted records or throws error.
 */
export async function upsertMoments(
  moments: Array<Database['public']['Tables']['in_process_moments']['Insert']>
): Promise<void> {
  if (!moments.length) {
    console.log('ℹ️  No moments to upsert');
    return;
  }

  const { error } = await supabase
    .from('in_process_moments')
    .upsert(moments, { onConflict: 'collection, token_id' });

  if (error) {
    console.error(`❌ upsertMoments error:`, error);
    throw error;
  }

  console.log(`✅ upsertMoments: Upserted ${moments.length} moments`);
}
