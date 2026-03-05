import { Catalog_Collections_t } from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapCatalogCollectionsToSupabase } from './mapCatalogCollectionsToSupabase';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';

export async function processCatalogCollectionsInBatches(
  collections: Catalog_Collections_t[]
): Promise<void> {
  let totalProcessed = 0;
  for (let i = 0; i < collections.length; i += BATCH_SIZE) {
    try {
      const batch = collections.slice(i, i + BATCH_SIZE);
      const mappedCollections = mapCatalogCollectionsToSupabase(batch);

      const artistAddresses = mappedCollections.map(c => c.default_admin);
      await ensureArtists(artistAddresses);

      await upsertCollections(mappedCollections);

      totalProcessed += mappedCollections.length;
      console.log(
        `📚 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processing ${batch.length} catalog collections`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} catalog collections`);
  else console.log(`ℹ️  No catalog collections to process`);
}
