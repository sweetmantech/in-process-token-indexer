import { upsertTokenAdmins } from '../supabase/in_process_token_admins/upsertTokenAdmins.js';
import { mapAdminsToSupabase } from '../admins/mapAdminsToSupabase.js';
import { extractTokenPairs } from '../supabase/in_process_token_admins/extractTokenPairs.js';
import { ensureArtists } from '../artists/ensureArtists.js';
import { getTokenIdsByAddressAndChainId } from '../moment/getTokenIdsByAddressAndChainId.js';
import { logForBaseOnly } from '../logForBaseOnly.js';

const BATCH_SIZE = 100; // Process admins in batches of 100

/**
 * Processes admin permission events in batches for better performance and memory management
 * @param {string} network - The network name (for logging purposes)
 * @param {Array<Object>} adminEvents - Array of admin permission events to process
 */
export async function processAdminsInBatches(network, adminEvents) {
  let totalProcessed = 0;

  // Since we're now filtering at the query level, we can process all events directly
  const totalBatches = Math.ceil(adminEvents.length / BATCH_SIZE);

  logForBaseOnly(
    network,
    `${network} - Processing ${adminEvents.length} admin permission events in ${totalBatches} batches of ${BATCH_SIZE}`
  );

  for (let i = 0; i < adminEvents.length; i += BATCH_SIZE) {
    const batch = adminEvents.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    try {
      logForBaseOnly(
        network,
        `${network} - Processing batch ${batchNumber}/${totalBatches} (${batch.length} admin events)`
      );

      // Get token pairs (address and chainId) from events
      const tokenPairs = extractTokenPairs(batch);

      // Get token IDs for existing tokens
      const tokenIdMap = await getTokenIdsByAddressAndChainId(tokenPairs);

      // Map to Supabase format (in_process_token_admins format)
      // This will filter out admins where token doesn't exist
      const mappedAdmins = mapAdminsToSupabase(batch, tokenIdMap);

      // Filter out admins where token doesn't exist
      if (mappedAdmins.length > 0) {
        // Ensure artists exist in the database
        const artistAddresses = mappedAdmins.map(admin => admin.artist_address);
        await ensureArtists(artistAddresses);

        // Upsert token admins
        await upsertTokenAdmins(mappedAdmins);

        totalProcessed += mappedAdmins.length;
      } else {
        logForBaseOnly(
          network,
          `${network} - Batch ${batchNumber}: No valid admin events found (tokens may not exist in in_process_tokens table)`
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
    `${network} - Completed processing: ${totalProcessed} admin permission events indexed`
  );
}
