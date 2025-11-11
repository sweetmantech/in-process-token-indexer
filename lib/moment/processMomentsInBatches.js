import { mapMomentsToSupabase } from '../supabase/in_process_tokens/mapMomentsToSupabase.js';
import { upsertTokens } from '../supabase/in_process_tokens/upsertTokens.js';
import { ensureArtists } from '../artists/ensureArtists.js';
import { logForBaseOnly } from '../logForBaseOnly.js';
import { getSalesForMoments } from './getSalesForMoments.js';

const BATCH_SIZE = 100; // Process moments in batches of 100

/**
 * Processes moment events in batches for better performance and memory management
 * @param {string} network - The network name (for logging purposes)
 * @param {Array<Object>} momentEvents - Array of moment events to process
 */
export async function processMomentsInBatches(network, momentEvents) {
  let totalProcessed = 0;

  // Since we're now filtering at the query level, we can process all events directly
  const totalBatches = Math.ceil(momentEvents.length / BATCH_SIZE);

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
        moment => moment.address && moment.defaultAdmin && moment.uri
      );

      if (validMoments.length > 0) {
        const adminAddresses = validMoments.map(moment => moment.defaultAdmin);
        await ensureArtists(adminAddresses);

        // Get sales for all valid moments
        try {
          const momentsWithSales = await getSalesForMoments(network, validMoments);
          logForBaseOnly(
            network,
            `${network} - Batch ${batchNumber}: Fetched sales for ${momentsWithSales.filter(m => m.sale !== null).length}/${validMoments.length} moments`
          );

          // You can use momentsWithSales here if needed for further processing
          // For now, we'll just log that we fetched them
          console.log(momentsWithSales, "ziad 1111111");
        } catch (error) {
          logForBaseOnly(
            network,
            `${network} - Batch ${batchNumber}: Error fetching sales: ${error.message}`
          );
        }

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
        await new Promise(resolve => setTimeout(resolve, 50));
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
    `${network} - Completed processing: ${totalProcessed} moments indexed`
  );
}
