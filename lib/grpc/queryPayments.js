import fetch from "node-fetch";

/**
 * Queries the GRPC endpoint to get ERC20Minter_ERC20RewardsDeposit events with pagination
 * @param {string} endpoint - The GRPC endpoint URL
 * @param {number} limit - Number of records to fetch per request (default: 1000)
 * @param {number} offset - Number of records to skip (default: 0)
 * @returns {Promise<Object>} - Object containing events and pagination info
 */
export async function queryPayments(endpoint, limit = 1000, offset = 0) {
  const query = `
    query MyQuery($limit: Int, $offset: Int) {
      ERC20Minter_ERC20RewardsDeposit(limit: $limit, offset: $offset, order_by: {blockNumber: desc}) {
        amount
        blockNumber
        collection
        currency
        id
        recipient
        transactionHash
        spender
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
        variables: { limit, offset },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const events = data.data?.ERC20Minter_ERC20RewardsDeposit || [];

    return {
      events,
      pageInfo: {
        hasNextPage: events.length === limit, // If we got a full batch, there might be more
        nextOffset: offset + limit,
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
