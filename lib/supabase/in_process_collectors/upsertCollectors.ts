import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

/**
 * Upserts collectors into Supabase.
 * @param collectors - Array of collector objects to upsert.
 * @returns Array of upserted collector rows.
 */
export async function upsertCollectors(
  collectors: Array<
    Database['public']['Tables']['in_process_collectors']['Insert']
  >
): Promise<void> {
  if (collectors.length === 0) {
    console.log('ℹ️  No collectors to upsert');
    return;
  }

  try {
    const { error } = await supabase
      .from('in_process_collectors')
      .upsert(collectors, {
        onConflict: 'id',
        ignoreDuplicates: false,
      });

    if (error) {
      throw error;
    }

    console.log(`✅ Upserted ${collectors.length} collector(s)`);
  } catch (error) {
    console.error(`❌ Failed to upsert collectors:`, error);
    throw error;
  }
}
