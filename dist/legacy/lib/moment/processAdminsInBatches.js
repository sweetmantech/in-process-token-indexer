"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAdminsInBatches = processAdminsInBatches;
const upsertTokenAdmins_1 = require("../supabase/in_process_token_admins/upsertTokenAdmins");
const mapAdminsToSupabase_1 = require("../admins/mapAdminsToSupabase");
const extractTokenPairs_1 = require("../supabase/in_process_token_admins/extractTokenPairs");
const ensureArtists_1 = require("../artists/ensureArtists");
const getTokenIdsByAddressAndChainId_1 = require("./getTokenIdsByAddressAndChainId");
const logForBaseOnly_1 = require("../logForBaseOnly");
const BATCH_SIZE = 100; // Process admins in batches of 100
/**
 * Processes admin permission events in batches for better performance and memory management
 * @param network - The network name (for logging purposes)
 * @param adminEvents - Array of admin permission events to process
 */
async function processAdminsInBatches(network, adminEvents) {
    let totalProcessed = 0;
    // Since we're now filtering at the query level, we can process all events directly
    const totalBatches = Math.ceil(adminEvents.length / BATCH_SIZE);
    (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Processing ${adminEvents.length} admin permission events in ${totalBatches} batches of ${BATCH_SIZE}`);
    for (let i = 0; i < adminEvents.length; i += BATCH_SIZE) {
        const batch = adminEvents.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        try {
            (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Processing batch ${batchNumber}/${totalBatches} (${batch.length} admin events)`);
            // Get token pairs (address and chainId) from events
            const tokenPairs = (0, extractTokenPairs_1.extractTokenPairs)(batch);
            // Get token IDs for existing tokens
            const tokenIdMap = await (0, getTokenIdsByAddressAndChainId_1.getTokenIdsByAddressAndChainId)(tokenPairs);
            // Map to Supabase format (in_process_token_admins format)
            // This will filter out admins where token doesn't exist
            const mappedAdmins = (0, mapAdminsToSupabase_1.mapAdminsToSupabase)(batch, tokenIdMap);
            // Filter out admins where token doesn't exist
            if (mappedAdmins.length > 0) {
                // Ensure artists exist in the database
                const artistAddresses = mappedAdmins.map(admin => admin.artist_address);
                await (0, ensureArtists_1.ensureArtists)(artistAddresses);
                // Upsert token admins
                await (0, upsertTokenAdmins_1.upsertTokenAdmins)(mappedAdmins);
                totalProcessed += mappedAdmins.length;
            }
            else {
                (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Batch ${batchNumber}: No valid admin events found (tokens may not exist in in_process_tokens table)`);
            }
            // Add a small delay between batches to prevent overwhelming the database
            if (batchNumber < totalBatches) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Batch ${batchNumber}: Error processing batch: ${errorMessage}`);
            // Continue with next batch instead of failing completely
        }
    }
    (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Completed processing: ${totalProcessed} admin permission events indexed`);
}
