import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

/**
 * Upserts fee recipients into Supabase.
 * @param feeRecipients - Array of fee recipient objects to upsert.
 * @returns Array of upserted fee recipient rows.
 */
export async function upsertFeeRecipients(
  feeRecipients: Array<
    Database['public']['Tables']['in_process_moment_fee_recipients']['Insert']
  >
): Promise<void> {
  if (feeRecipients.length === 0) {
    console.log('ℹ️  No fee recipients to upsert');
    return;
  }

  try {
    const { error } = await supabase
      .from('in_process_moment_fee_recipients')
      .upsert(feeRecipients, {
        onConflict: 'moment,artist_address',
        ignoreDuplicates: false,
      });

    if (error) {
      throw error;
    }

    console.log(`✅ Upserted ${feeRecipients.length} fee recipient(s)`);
  } catch (error) {
    console.error(`❌ Failed to upsert fee recipients:`, error);
    throw error;
  }
}
