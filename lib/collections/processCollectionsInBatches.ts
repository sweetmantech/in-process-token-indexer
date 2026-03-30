import { Catalog_Collections_t, InProcess_Collections_t } from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapCollectionsToSupabase } from './mapCollectionsToSupabase';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import { emitCollectionUpdated } from '@/lib/socket/emitCollectionUpdated';

export async function processCollectionsInBatches(
  collections: InProcess_Collections_t[] | Catalog_Collections_t[]
): Promise<void> {
  let totalProcessed = 0;
  for (let i = 0; i < collections.length; i += BATCH_SIZE) {
    try {
      const batch = collections.slice(i, i + BATCH_SIZE);
      const mappedCollections = mapCollectionsToSupabase(batch);

      // Ensure artists exist in the database
      const artistAddresses = mappedCollections.map(
        collection => collection.creator
      );
      await ensureArtists(artistAddresses);

      await upsertCollections(mappedCollections);
      emitCollectionUpdated(batch);

      totalProcessed += mappedCollections.length;
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
