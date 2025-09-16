import fetch from "node-fetch";

/**
 * Queries the GRPC endpoint to get ERC20Minter_ERC20RewardsDeposit events
 * @param {string} endpoint - The GRPC endpoint URL
 * @returns {Promise<Array<Object>>} - Array of payment events
 */
export async function queryPayments(endpoint) {
  const query = `
    query MyQuery {
      ERC20Minter_ERC20RewardsDeposit {
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
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data?.ERC20Minter_ERC20RewardsDeposit || [];
  } catch (error) {
    console.error("Error querying payments:", error);
    throw error;
  }
}
