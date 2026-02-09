import { InProcess_Moments_t } from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapMomentsToSupabase } from '@/lib/moments/mapMomentsToSupabase';
import { upsertMoments } from '@/lib/supabase/in_process_moments/upsertMoments';
import { emitMomentUpdated } from '@/lib/socket/emitMomentUpdated';

export async function processMomentsInBatches(
  moments: InProcess_Moments_t[]
): Promise<void> {
  let totalProcessed = 0;

  for (let i = 0; i < moments.length; i += BATCH_SIZE) {
    try {
      const batch = moments.slice(i, i + BATCH_SIZE);
      const mappedMoments = await mapMomentsToSupabase(batch);

      await upsertMoments(mappedMoments);
      emitMomentUpdated(batch);

      totalProcessed += mappedMoments.length;
      console.log(
        `📚 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processing ${batch.length} moments`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} moments`);
  else console.log(`ℹ️  No moments to process`);
}
