import { mapMomentsToSupabase } from "../supabase/in_process_tokens/mapMomentsToSupabase.js";
import { upsertTokens } from "../supabase/in_process_tokens/upsertTokens.js";
import { ensureArtists } from "../artists/ensureArtists.js";
import { logForBaseOnly } from "../logForBaseOnly.js";
import { getMaxBlockTimestamp } from "../supabase/in_process_tokens/getMaxBlockTimestamp.js";

const BATCH_SIZE = 100; // Process moments in batches of 100

/**
 * Processes moment events in batches for better performance and memory management
 * @param {string} network - The network name (for logging purposes)
 * @param {Array<Object>} momentEvents - Array of moment events to process
 */
export async function processMomentsInBatches(network, momentEvents) {
  let totalProcessed = 0;

  const maxBlockTimestamp = await getMaxBlockTimestamp();

  const momentsEventsToProcess = momentEvents.filter(moment => new Date(Number(moment.blockTimestamp) * 1000).getTime() / 1000 > maxBlockTimestamp);
  const totalBatches = Math.ceil(momentsEventsToProcess.length / BATCH_SIZE);

  logForBaseOnly(
    network,
    `${network} - Processing ${momentsEventsToProcess.length} moments in ${totalBatches} batches of ${BATCH_SIZE}`
  );

  for (let i = 0; i < momentsEventsToProcess.length; i += BATCH_SIZE) {
    const batch = momentsEventsToProcess.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    try {
      logForBaseOnly(
        network,
        `${network} - Processing batch ${batchNumber}/${totalBatches} (${batch.length} moments)`
      );

      // Map to Supabase format (in_process_tokens format)
      const mappedMoments = mapMomentsToSupabase(batch);

      // Filter out moments without required fields
      const validMoments = mappedMoments.filter(
        (moment) => moment.address && moment.defaultAdmin && moment.uri
      );

      if (validMoments.length > 0) {
        const adminAddresses = validMoments.map((moment) => moment.defaultAdmin);
        await ensureArtists(adminAddresses);
        await upsertTokens(validMoments);

        totalProcessed += validMoments.length;
      } else {
        logForBaseOnly(
          network,
          `${network} - Batch ${batchNumber}: No valid moments found`
        );
      }

      // Add a small delay between batches to prevent overwhelming the database
      if (batchNumber < totalBatches) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (error) {
      logForBaseOnly(
        network,
        `${network} - Batch ${batchNumber}: Error processing batch: ${error.message}`
      );
      // Continue with next batch instead of failing completely
    }
  }

  logForBaseOnly(
    network,
    `${network} - Completed processing: ${totalProcessed}/${momentEvents.length} moments checked, ${totalProcessed} new moments indexed, ${momentEvents.length - totalProcessed} already existed`
  );
}
