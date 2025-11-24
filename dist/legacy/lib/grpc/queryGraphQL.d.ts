interface PageInfo {
    hasNextPage: boolean;
    nextOffset: number;
}
interface QueryResult {
    events: unknown[];
    pageInfo: PageInfo;
}
/**
 * Generic function to query GraphQL endpoints with pagination
 * @param endpoint - The GraphQL endpoint URL
 * @param query - The GraphQL query string
 * @param dataPath - The path to extract events from the response (e.g., "ERC20Minter_ERC20RewardsDeposit")
 * @param limit - Number of records to fetch per request (default: 1000)
 * @param offset - Number of records to skip (default: 0)
 * @param queryVariables - Dynamic variables to pass to the query (default: {})
 * @returns Object containing events and pagination info
 */
export declare function queryGraphQL(endpoint: string, query: string, dataPath: string, limit?: number, offset?: number, queryVariables?: Record<string, unknown>): Promise<QueryResult>;
export {};
//# sourceMappingURL=queryGraphQL.d.ts.map