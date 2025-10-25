import { mapMomentsToSupabase } from "../supabase/in_process_tokens/mapMomentsToSupabase.js";
import { upsertTokens } from "../supabase/in_process_tokens/upsertTokens.js";
import { ensureArtists } from "../artists/ensureArtists.js";
import { logForBaseOnly } from "../logForBaseOnly.js";

const BATCH_SIZE = 100; // Process moments in batches of 100

/**
 * Processes moment events in batches for better performance and memory management
 * @param {string} network - The network name (for logging purposes)
 * @param {Array<Object>} momentEvents - Array of moment events to process
 */
export async function processMomentsInBatches(network, momentEvents) {
  const totalBatches = Math.ceil(momentEvents.length / BATCH_SIZE);
  let totalProcessed = 0;

  logForBaseOnly(
    network,
    `${network} - Processing ${momentEvents.length} moments in ${totalBatches} batches of ${BATCH_SIZE}`
  );

  for (let i = 0; i < momentEvents.length; i += BATCH_SIZE) {
    const batch = momentEvents.slice(i, i + BATCH_SIZE);
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
        // Ensure all defaultAdmins exist in the artists table
        const adminAddresses = validMoments.map((moment) => moment.defaultAdmin);
        await ensureArtists(adminAddresses);

        // Upsert to database using in_process_tokens table
        await upsertTokens(validMoments);

        totalProcessed += validMoments.length;
        logForBaseOnly(
          network,
          `${network} - Batch ${batchNumber}: Successfully processed ${validMoments.length} moments`
        );
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
    `${network} - Completed processing: ${totalProcessed}/${momentEvents.length} moments indexed`
  );
}
