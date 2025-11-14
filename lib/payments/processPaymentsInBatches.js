import { mapPaymentsToSupabase } from '../supabase/in_process_payments/mapPaymentsToSupabase.js';
import { resolveTokensForPayments } from './resolveTokens.js';
import { upsertPayments } from '../supabase/in_process_payments/upsertPayments.js';
import { ensureArtists } from '../artists/ensureArtists.js';
import { logForBaseOnly } from '../logForBaseOnly.js';

const BATCH_SIZE = 100; // Process payments in batches of 100

/**
 * Processes payment events in batches for better performance and memory management
 * @param {string} network - The network name (for logging purposes)
 * @param {Array<Object>} paymentEvents - Array of payment events to process
 */
export async function processPaymentsInBatches(network, paymentEvents) {
  const totalBatches = Math.ceil(paymentEvents.length / BATCH_SIZE);
  let totalProcessed = 0;

  logForBaseOnly(
    network,
    `${network} - Processing ${paymentEvents.length} payments in ${totalBatches} batches of ${BATCH_SIZE}`
  );

  for (let i = 0; i < paymentEvents.length; i += BATCH_SIZE) {
    const batch = paymentEvents.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    try {
      logForBaseOnly(
        network,
        `${network} - Processing batch ${batchNumber}/${totalBatches} (${batch.length} payments)`
      );

      // Map to Supabase format
      const mappedPayments = mapPaymentsToSupabase(batch);

      // Resolve token IDs for payments
      const paymentsWithTokens = await resolveTokensForPayments(mappedPayments);

      // Filter out payments without required fields
      const validPayments = paymentsWithTokens.filter(
        payment =>
          payment.hash &&
          payment.buyer &&
          payment.token &&
          payment.amount !== '0.000000'
      );

      if (validPayments.length > 0) {
        // Ensure all buyers exist in the artists table
        const buyerAddresses = validPayments.map(payment => payment.buyer);
        await ensureArtists(buyerAddresses);

        // Remove collection and currency fields before upserting
        const finalPayments = validPayments.map(
          ({ collection, currency, ...payment }) => payment
        );

        // Upsert to database
        await upsertPayments(finalPayments);

        totalProcessed += validPayments.length;
        logForBaseOnly(
          network,
          `${network} - Batch ${batchNumber}: Successfully processed ${validPayments.length} payments`
        );
      } else {
        logForBaseOnly(
          network,
          `${network} - Batch ${batchNumber}: No valid payments found`
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
    `${network} - Completed processing: ${totalProcessed}/${paymentEvents.length} payments indexed`
  );
}
