"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryGraphQL = queryGraphQL;
const node_fetch_1 = __importDefault(require("node-fetch"));
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
async function queryGraphQL(endpoint, query, dataPath, limit = 1000, offset = 0, queryVariables = {}) {
    try {
        const response = await (0, node_fetch_1.default)(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { limit, offset, ...queryVariables },
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json());
        if (data.errors) {
            throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
        }
        // Extract events using the provided data path
        const events = data.data?.[dataPath] || [];
        return {
            events,
            pageInfo: {
                hasNextPage: events.length === limit, // If we got a full batch, there might be more
                nextOffset: offset + limit,
            },
        };
    }
    catch (error) {
        console.error(`Error querying GraphQL endpoint:`, error);
        throw error;
    }
}
