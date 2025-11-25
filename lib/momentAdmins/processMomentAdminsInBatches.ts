import { InProcess_Moment_Admins_t } from '@/types/envio';
import { BATCH_SIZE } from '../consts';
import { mapMomentAdminsToSupabase } from './mapMomentAdminsToSupabase';
import { upsertMomentAdmins } from '../supabase/in_process_moment_admins/upsertMomentAdmins';

export async function processMomentAdminsInBatches(
  momentAdmins: InProcess_Moment_Admins_t[]
): Promise<void> {
  let totalProcessed = 0;

  for (let i = 0; i < momentAdmins.length; i += BATCH_SIZE) {
    try {
      const batch = momentAdmins.slice(i, i + BATCH_SIZE);
      const mappedAdmins = await mapMomentAdminsToSupabase(batch);

      await upsertMomentAdmins(mappedAdmins);

      totalProcessed += mappedAdmins.length;
      console.log(
        `👥 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processing ${batch.length} moment admins`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} moment admins`);
  else console.log(`ℹ️  No moment admins to process`);
}
