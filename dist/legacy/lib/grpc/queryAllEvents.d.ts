/**
 * Query ALL events using GraphQL with pagination
 * @param endpoint - The GraphQL endpoint URL
 * @param query - The GraphQL query string
 * @param dataPath - The path to extract events from the response
 * @param batchSize - Number of records to fetch per request (default: 1000)
 * @param queryVariables - Dynamic variables to pass to the query (default: {})
 * @returns Array of all events
 */
export declare function queryAllEvents(endpoint: string, query: string, dataPath: string, batchSize?: number, queryVariables?: Record<string, unknown>): Promise<unknown[]>;
//# sourceMappingURL=queryAllEvents.d.ts.map