import { InProcess_Admins_t } from '@/types/envio';
import { BATCH_SIZE } from '../consts';
import { mapAdminsToSupabase } from './mapAdminsToSupabase';
import { upsertAdmins } from '../supabase/in_process_admins/upsertAdmins';
import { ensureArtists } from '../supabase/in_process_artists/ensureArtists';

export async function processAdminsInBatches(
  admins: InProcess_Admins_t[]
): Promise<void> {
  let totalProcessed = 0;

  for (let i = 0; i < admins.length; i += BATCH_SIZE) {
    try {
      const batch = admins.slice(i, i + BATCH_SIZE);
      const mappedAdmins = await mapAdminsToSupabase(batch);

      const artistAddresses = mappedAdmins.map(admin => admin.artist_address);
      await ensureArtists(artistAddresses);
      await upsertAdmins(mappedAdmins);

      console.log(
        `👥 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${mappedAdmins.length} admins`
      );
      totalProcessed += mappedAdmins.length;
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} admins`);
  else console.log(`ℹ️  No admins to process`);
}
