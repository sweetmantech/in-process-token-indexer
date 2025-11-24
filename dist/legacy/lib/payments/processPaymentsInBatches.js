"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPaymentsInBatches = processPaymentsInBatches;
const mapPaymentsToSupabase_1 = require("../supabase/in_process_payments/mapPaymentsToSupabase");
const resolveTokens_1 = require("./resolveTokens");
const upsertPayments_1 = require("../supabase/in_process_payments/upsertPayments");
const ensureArtists_1 = require("../artists/ensureArtists");
const logForBaseOnly_1 = require("../logForBaseOnly");
const BATCH_SIZE = 100; // Process payments in batches of 100
/**
 * Processes payment events in batches for better performance and memory management
 * @param network - The network name (for logging purposes)
 * @param paymentEvents - Array of payment events to process
 */
async function processPaymentsInBatches(network, paymentEvents) {
    const totalBatches = Math.ceil(paymentEvents.length / BATCH_SIZE);
    let totalProcessed = 0;
    (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Processing ${paymentEvents.length} payments in ${totalBatches} batches of ${BATCH_SIZE}`);
    for (let i = 0; i < paymentEvents.length; i += BATCH_SIZE) {
        const batch = paymentEvents.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        try {
            (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Processing batch ${batchNumber}/${totalBatches} (${batch.length} payments)`);
            // Map to Supabase format
            const mappedPayments = (0, mapPaymentsToSupabase_1.mapPaymentsToSupabase)(batch);
            // Resolve token IDs for payments
            const paymentsWithTokens = await (0, resolveTokens_1.resolveTokensForPayments)(mappedPayments);
            // Filter out payments without required fields
            const validPayments = paymentsWithTokens.filter(payment => payment.hash &&
                payment.buyer &&
                payment.token &&
                payment.amount !== 0.0);
            if (validPayments.length > 0) {
                // Ensure all buyers exist in the artists table
                const buyerAddresses = validPayments.map(payment => payment.buyer);
                await (0, ensureArtists_1.ensureArtists)(buyerAddresses);
                // Remove collection and currency fields before upserting
                const finalPayments = validPayments.map(({ collection, currency, ...payment }) => payment);
                // Upsert to database
                await (0, upsertPayments_1.upsertPayments)(finalPayments);
                totalProcessed += validPayments.length;
                (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Batch ${batchNumber}: Successfully processed ${validPayments.length} payments`);
            }
            else {
                (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Batch ${batchNumber}: No valid payments found`);
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
    (0, logForBaseOnly_1.logForBaseOnly)(network, `${network} - Completed processing: ${totalProcessed}/${paymentEvents.length} payments indexed`);
}
