import { queryAllPayments } from "./queryAllPayments.js";
import { processPaymentsInBatches } from "./processPaymentsInBatches.js";
import { logForBaseOnly } from "../logForBaseOnly.js";
import { GRPC_ENDPOINT } from "../const.js";

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

      // Query payments from GRPC endpoint with pagination
      const paymentEvents = await queryAllPayments(GRPC_ENDPOINT, 1000);

      if (paymentEvents.length > 0) {
        logForBaseOnly(
          network,
          `${network} - Found ${paymentEvents.length} payment events`
        );

        // Process payments in batches for better performance
        await processPaymentsInBatches(network, paymentEvents);
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
