import { InProcess_Collection_Admins_t } from '@/types/envio';
import { BATCH_SIZE } from '../consts';
import { mapCollectionAdminsToSupabase } from './mapCollectionAdminsToSupabase';
import { upsertCollectionAdmins } from '../supabase/in_process_collection_admins/upsertCollectionAdmins';
import { ensureArtists } from '../supabase/in_process_artists/ensureArtists';

export async function processCollectionAdminsInBatches(
  collectionAdmins: InProcess_Collection_Admins_t[]
): Promise<void> {
  let totalProcessed = 0;

  for (let i = 0; i < collectionAdmins.length; i += BATCH_SIZE) {
    try {
      const batch = collectionAdmins.slice(i, i + BATCH_SIZE);
      const mappedAdmins = await mapCollectionAdminsToSupabase(batch);

      const artistAddresses = mappedAdmins.map(admin => admin.artist_address);
      await ensureArtists(artistAddresses);
      await upsertCollectionAdmins(mappedAdmins);

      console.log(
        `👥 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${mappedAdmins.length} collection admins`
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
    console.log(
      `✅  Completed processing: ${totalProcessed} collection admins`
    );
  else console.log(`ℹ️  No collection admins to process`);
}
