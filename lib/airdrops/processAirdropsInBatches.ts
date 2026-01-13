import { InProcess_Airdrops_t } from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapAirdropsToSupabase } from './mapAirdropsToSupabase';
import { upsertAirdrops } from '@/lib/supabase/in_process_airdrops/upsertAirdrops';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';

/**
 * Processes airdrops in batches and upserts them to Supabase.
 * @param airdrops - Array of InProcess_Airdrops_t from Envio.
 */
export async function processAirdropsInBatches(
  airdrops: InProcess_Airdrops_t[]
): Promise<void> {
  let totalProcessed = 0;

  for (let i = 0; i < airdrops.length; i += BATCH_SIZE) {
    try {
      const batch = airdrops.slice(i, i + BATCH_SIZE);
      const mappedAirdrops = await mapAirdropsToSupabase(batch);

      const artistAddresses = [
        ...new Set(mappedAirdrops.map(airdrop => airdrop.artist_address)),
      ];
      await ensureArtists(artistAddresses);

      await upsertAirdrops(mappedAirdrops);

      console.log(
        `🎁 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${mappedAirdrops.length} airdrops`
      );
      totalProcessed += mappedAirdrops.length;
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} airdrops`);
  else console.log(`ℹ️  No airdrops to process`);
}
