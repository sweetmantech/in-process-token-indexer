import { InProcess_Comments_t } from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapCommentsToSupabase } from './mapCommentsToSupabase';
import { upsertComments } from '@/lib/supabase/in_process_moment_comments/upsertComments';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';

export async function processCommentsInBatches(
  comments: InProcess_Comments_t[]
): Promise<void> {
  let totalProcessed = 0;

  for (let i = 0; i < comments.length; i += BATCH_SIZE) {
    try {
      const batch = comments.slice(i, i + BATCH_SIZE);
      const mappedComments = await mapCommentsToSupabase(batch);

      const artistAddresses = mappedComments.map(
        comment => comment.artist_address
      );
      await ensureArtists(artistAddresses);
      await upsertComments(mappedComments);

      console.log(
        `💬 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${mappedComments.length} moment comments`
      );
      totalProcessed += mappedComments.length;
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} moment comments`);
  else console.log(`ℹ️  No moment comments to process`);
}
