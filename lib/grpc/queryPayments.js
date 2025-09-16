import fetch from "node-fetch";

/**
 * Queries the GRPC endpoint to get ERC20Minter_ERC20RewardsDeposit events with pagination
 * @param {string} endpoint - The GRPC endpoint URL
 * @param {number} limit - Number of records to fetch per request (default: 1000)
 * @param {string} cursor - Cursor for pagination (optional)
 * @returns {Promise<Object>} - Object containing events and pagination info
 */
export async function queryPayments(endpoint, limit = 1000, cursor = null) {
  const query = `
    query MyQuery($limit: Int, $cursor: String) {
      ERC20Minter_ERC20RewardsDeposit(first: $limit, after: $cursor, orderBy: blockNumber, orderDirection: asc) {
        edges {
          node {
            amount
            blockNumber
            collection
            currency
            id
            recipient
            transactionHash
            spender
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { limit, cursor },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const edges = data.data?.ERC20Minter_ERC20RewardsDeposit?.edges || [];
    const pageInfo = data.data?.ERC20Minter_ERC20RewardsDeposit?.pageInfo || {};

    return {
      events: edges.map((edge) => edge.node),
      pageInfo: {
        hasNextPage: pageInfo.hasNextPage || false,
        endCursor: pageInfo.endCursor || null,
      },
    };
  } catch (error) {
    console.error("Error querying payments:", error);
    throw error;
  }
}

/**
 * Queries ALL payment events using pagination (for backward compatibility)
 * @param {string} endpoint - The GRPC endpoint URL
 * @param {number} batchSize - Number of records to fetch per request (default: 1000)
 * @returns {Promise<Array<Object>>} - Array of all payment events
 */
export async function queryAllPayments(endpoint, batchSize = 1000) {
  const allEvents = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await queryPayments(endpoint, batchSize, cursor);

    allEvents.push(...result.events);
    hasNextPage = result.pageInfo.hasNextPage;
    cursor = result.pageInfo.endCursor;

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
