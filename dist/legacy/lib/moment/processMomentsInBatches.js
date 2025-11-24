"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMomentsInBatches = processMomentsInBatches;
const mapMomentsToSupabase_1 = require("../supabase/in_process_tokens/mapMomentsToSupabase");
const upsertTokens_1 = require("../supabase/in_process_tokens/upsertTokens");
const ensureArtists_1 = require("../artists/ensureArtists");
const logForBaseOnly_1 = require("../logForBaseOnly");
const processTokenFeeRecipients_1 = require("./processTokenFeeRecipients");
const BATCH_SIZE = 100; // Process moments in batches of 100
/**
 * Processes moment events in batches for better performance and memory management
 * @param network - The network name (for logging purposes)
 * @param momentEvents - Array of moment events to process
 */
async function processMomentsInBatches(network, momentEvents) {
    let totalProcessed = 0;
    // Since we're now filtering at the query level, we can process all events directly
    const totalBatches = Math.ceil(momentEvents.length / BATCH_SIZE);
    (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Processing ${momentEvents.length} moments in ${totalBatches} batches of ${BATCH_SIZE}`);
    for (let i = 0; i < momentEvents.length; i += BATCH_SIZE) {
        const batch = momentEvents.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        try {
            (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Processing batch ${batchNumber}/${totalBatches} (${batch.length} moments)`);
            // Map to Supabase format (in_process_tokens format)
            const mappedMoments = (0, mapMomentsToSupabase_1.mapMomentsToSupabase)(batch);
            // Filter out moments without required fields
            const validMoments = mappedMoments.filter(moment => moment.address && moment.defaultAdmin && moment.uri);
            // Filter out moments which can include 0xSplit -> payout
            if (validMoments.length > 0) {
                const adminAddresses = validMoments.map(moment => moment.defaultAdmin);
                await (0, ensureArtists_1.ensureArtists)(adminAddresses);
                const upsertedTokens = await (0, upsertTokens_1.upsertTokens)(validMoments);
                // Process token fee recipients for tokens with split contract payout recipients
                // Convert null to undefined for payoutRecipient to match expected type
                const tokensForFeeRecipients = upsertedTokens.map(token => ({
                    ...token,
                    payoutRecipient: token.payoutRecipient ?? undefined,
                }));
                await (0, processTokenFeeRecipients_1.processTokenFeeRecipients)(network, tokensForFeeRecipients);
                totalProcessed += validMoments.length;
            }
            else {
                (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Batch ${batchNumber}: No valid moments found`);
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
    (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Completed processing: ${totalProcessed} moments indexed`);
}
