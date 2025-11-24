"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAllEvents = queryAllEvents;
const queryGraphQL_1 = require("./queryGraphQL");
/**
 * Query ALL events using GraphQL with pagination
 * @param endpoint - The GraphQL endpoint URL
 * @param query - The GraphQL query string
 * @param dataPath - The path to extract events from the response
 * @param batchSize - Number of records to fetch per request (default: 1000)
 * @param queryVariables - Dynamic variables to pass to the query (default: {})
 * @returns Array of all events
 */
async function queryAllEvents(endpoint, query, dataPath, batchSize = 1000, queryVariables = {}) {
    const allEvents = [];
    let offset = 0;
    let hasNextPage = true;
    while (hasNextPage) {
        const result = await (0, queryGraphQL_1.queryGraphQL)(endpoint, query, dataPath, batchSize, offset, queryVariables);
        allEvents.push(...result.events);
        hasNextPage = result.pageInfo.hasNextPage;
        offset = result.pageInfo.nextOffset;
        console.log(`Fetched ${result.events.length} events (total: ${allEvents.length})`);
        // Add a small delay between requests to be respectful to the API
        if (hasNextPage) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    return allEvents;
}
