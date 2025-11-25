import { InProcess_Collections_t } from '@/types/envio';
import { BATCH_SIZE } from '../consts';
import { mapCollectionsToSupabase } from './mapCollectionsToSupabase';
import { ensureArtists } from '../supabase/in_process_artists/ensureArtists';
import { upsertCollections } from '../supabase/in_process_collections/upsertCollections';

export async function processCollectionsInBatches(
  collections: InProcess_Collections_t[]
): Promise<void> {
  let totalProcessed = 0;
  for (let i = 0; i < collections.length; i += BATCH_SIZE) {
    try {
      const batch = collections.slice(i, i + BATCH_SIZE);
      const mappedCollections = mapCollectionsToSupabase(batch);

      // Ensure artists exist in the database
      const artistAddresses = mappedCollections.map(
        collection => collection.default_admin
      );
      await ensureArtists(artistAddresses);

      const upsertedCollections = await upsertCollections(mappedCollections);

      totalProcessed += upsertedCollections.length;
      console.log(
        `📚 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processing ${batch.length} collections`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} collections`);
  else console.log(`ℹ️  No collections to process`);
}
