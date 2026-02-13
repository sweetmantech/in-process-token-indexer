import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

/**
 * Upserts airdrops into Supabase.
 * @param airdrops - Array of airdrop objects to upsert.
 * @returns Array of upserted airdrop rows.
 */
export async function upsertAirdrops(
  airdrops: Array<Database['public']['Tables']['in_process_airdrops']['Insert']>
): Promise<void> {
  if (airdrops.length === 0) {
    console.log('ℹ️  No airdrops to upsert');
    return;
  }

  try {
    const { error } = await supabase
      .from('in_process_airdrops')
      .upsert(airdrops, {
        onConflict: 'moment,recipient',
        ignoreDuplicates: false,
      });

    if (error) {
      throw error;
    }

    console.log(`✅ Upserted ${airdrops.length} airdrop(s)`);
  } catch (error) {
    console.error(`❌ Failed to upsert airdrops:`, error);
    throw error;
  }
}
