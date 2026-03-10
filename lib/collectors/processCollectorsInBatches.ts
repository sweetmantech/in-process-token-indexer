import { Collectors_t } from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapCollectorsToSupabase } from './mapCollectorsToSupabase';
import { upsertCollectors } from '@/lib/supabase/in_process_collectors/upsertCollectors';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';

/**
 * Processes collectors in batches and upserts them to Supabase.
 * @param collectors - Array of Collectors_t from Envio.
 */
export async function processCollectorsInBatches(
  collectors: Collectors_t[]
): Promise<void> {
  let totalProcessed = 0;

  for (let i = 0; i < collectors.length; i += BATCH_SIZE) {
    try {
      const batch = collectors.slice(i, i + BATCH_SIZE);
      const mappedCollectors = await mapCollectorsToSupabase(batch);

      const artistAddresses = [
        ...new Set(mappedCollectors.map(collector => collector.collector)),
      ];
      await ensureArtists(artistAddresses);

      await upsertCollectors(mappedCollectors);

      console.log(
        `🎁 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${mappedCollectors.length} collectors`
      );
      totalProcessed += mappedCollectors.length;
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} collectors`);
  else console.log(`ℹ️  No collectors to process`);
}
