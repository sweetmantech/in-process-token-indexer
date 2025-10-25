import { queryGraphQL } from "./queryGraphQL.js";

/**
 * Query ALL events using GraphQL with pagination
 * @param {string} endpoint - The GraphQL endpoint URL
 * @param {string} query - The GraphQL query string
 * @param {string} dataPath - The path to extract events from the response
 * @param {number} batchSize - Number of records to fetch per request (default: 1000)
 * @returns {Promise<Array<Object>>} - Array of all events
 */
export async function queryAllEvents(endpoint, query, dataPath, batchSize = 1000) {
  const allEvents = [];
  let offset = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await queryGraphQL(endpoint, query, dataPath, batchSize, offset);

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
