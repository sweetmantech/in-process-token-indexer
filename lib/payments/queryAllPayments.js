import { queryPayments } from "../grpc/queryPayments.js";

/**
 * Queries ALL payment events using pagination (for backward compatibility)
 * @param {string} endpoint - The GRPC endpoint URL
 * @param {number} batchSize - Number of records to fetch per request (default: 1000)
 * @returns {Promise<Array<Object>>} - Array of all payment events
 */
export async function queryAllPayments(endpoint, batchSize = 1000) {
  const allEvents = [];
  let offset = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await queryPayments(endpoint, batchSize, offset);

    allEvents.push(...result.events);
    hasNextPage = result.pageInfo.hasNextPage;
    offset = result.pageInfo.nextOffset;

    console.log(
      `Fetched ${result.events.length} events (total: ${allEvents.length})`
    );

    // Add a small delay between requests to be respectful to the API
    if (hasNextPage) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allEvents;
}
