import {
  Catalog_Admins_t,
  InProcess_Admins_t,
  Sound_Admins_t,
  ZoraMedia_Admins_t,
} from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapAdminsToSupabase } from './mapAdminsToSupabase';
import { mapAdminsForDeletion } from './mapAdminsForDeletion';
import { upsertAdmins } from '@/lib/supabase/in_process_admins/upsertAdmins';
import { deleteAdmins } from '@/lib/supabase/in_process_admins/deleteAdmins';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';
import { getScope } from './getScope';

/**
 * Processes admins in batches with scope-based logic:
 * - scope = 0: Delete from Supabase
 * - scope != 0: Upsert to Supabase
 */
export async function processAdminsInBatches(
  admins: (
    | InProcess_Admins_t
    | Catalog_Admins_t
    | Sound_Admins_t
    | ZoraMedia_Admins_t
  )[]
): Promise<void> {
  let totalDeleted = 0;
  let totalUpserted = 0;

  for (let i = 0; i < admins.length; i += BATCH_SIZE) {
    try {
      const batch = admins.slice(i, i + BATCH_SIZE);
      const batchToDelete = batch.filter(admin => getScope(admin) === 0);
      const batchToUpsert = batch.filter(admin => getScope(admin) !== 0);

      // Process deletions
      if (batchToDelete.length > 0) {
        const deleteCriteria = await mapAdminsForDeletion(batchToDelete);
        const deletedCount = await deleteAdmins(deleteCriteria);
        totalDeleted += deletedCount;
      }

      // Process upserts
      if (batchToUpsert.length > 0) {
        const mappedAdmins = await mapAdminsToSupabase(batchToUpsert);
        const artistAddresses = mappedAdmins.map(admin => admin.artist_address);
        await ensureArtists(artistAddresses);
        await upsertAdmins(mappedAdmins);
        totalUpserted += mappedAdmins.length;
      }

      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      console.log(
        `👥 Batch ${batchNum}: ${totalDeleted} deleted, ${totalUpserted} upserted`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalDeleted > 0 || totalUpserted > 0) {
    console.log(
      `✅  Completed processing: ${totalDeleted} deleted, ${totalUpserted} upserted`
    );
  } else {
    console.log(`ℹ️  No admins to process`);
  }
}
