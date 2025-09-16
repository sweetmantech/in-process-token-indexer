import { queryPayments } from "./grpc/queryPayments.js";
import { mapPaymentsToSupabase } from "./supabase/in_process_payments/mapPaymentsToSupabase.js";
import { resolveTokensForPayments } from "./supabase/in_process_payments/resolveTokens.js";
import { upsertPayments } from "./supabase/in_process_payments/upsertPayments.js";
import { ensureArtists } from "./artists/ensureArtists.js";
import { logForBaseOnly } from "./logForBaseOnly.js";

const GRPC_ENDPOINT = "https://indexer.dev.hyperindex.xyz/9155af6/v1/graphql";

/**
 * Indexes payment events from the GRPC endpoint
 * @param {string} network - The network name (for logging purposes)
 */
async function indexPayments(network) {
  logForBaseOnly(network, `Starting payments indexer for ${network}...`);

  while (true) {
    try {
      logForBaseOnly(
        network,
        `${network} - Querying payments from GRPC endpoint...`
      );

      // Query payments from GRPC endpoint
      const paymentEvents = await queryPayments(GRPC_ENDPOINT);

      if (paymentEvents.length > 0) {
        logForBaseOnly(
          network,
          `${network} - Found ${paymentEvents.length} payment events`
        );

        // Map to Supabase format
        const mappedPayments = mapPaymentsToSupabase(paymentEvents);

        // Resolve token IDs for payments
        const paymentsWithTokens = await resolveTokensForPayments(
          mappedPayments
        );

        // Filter out payments without required fields
        const validPayments = paymentsWithTokens.filter(
          (payment) => payment.hash && payment.buyer && payment.token
        );

        if (validPayments.length > 0) {
          logForBaseOnly(
            network,
            `${network} - Found ${validPayments.length} valid payments`
          );

          // Ensure all buyers exist in the artists table
          const buyerAddresses = validPayments.map((payment) => payment.buyer);
          await ensureArtists(buyerAddresses);

          logForBaseOnly(
            network,
            `${network} - Upserting ${validPayments.length} payments`
          );

          // Remove collection and currency fields before upserting (they're not in the table)
          const finalPayments = validPayments.map(
            ({ collection, currency, ...payment }) => payment
          );

          // Upsert to database
          await upsertPayments(finalPayments);

          logForBaseOnly(
            network,
            `${network} - Successfully indexed ${validPayments.length} payments`
          );
        } else {
          logForBaseOnly(
            network,
            `${network} - No valid payments found (missing required fields or token resolution failed)`
          );
        }
      } else {
        logForBaseOnly(network, `${network} - No new payment events found`);
      }

      // Poll every 30 seconds for payments
      await new Promise((resolve) => setTimeout(resolve, 30000));
    } catch (error) {
      if (network === "base") {
        console.error(`${network} - Error in indexPayments:`, error);
      }
      logForBaseOnly(
        network,
        `${network} - Payments indexer error, retrying in 1 minute...`
      );
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }
}

export default indexPayments;
