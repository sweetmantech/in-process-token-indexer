import { selectTokens } from '../supabase/in_process_tokens/selectTokens.js';

/**
 * Resolves token IDs for payments based on collection or currency
 * @param {Array<Object>} payments - Array of payment objects with collection/currency info
 * @returns {Promise<Array<Object>>} - Payments with resolved token IDs
 */
export async function resolveTokensForPayments(payments) {
  const paymentsWithTokens = [];

  for (const payment of payments) {
    let tokenId = null;

    // Try to find matching token by collection or currency
    if (payment.collection || payment.currency) {
      const addresses = [payment.collection, payment.currency].filter(Boolean);
      const tokens = await selectTokens(addresses, 'id, address');

      if (tokens.length > 0) {
        tokenId = tokens[0].id;
      }
    }

    // Only include payments with valid tokens
    if (tokenId) {
      paymentsWithTokens.push({
        ...payment,
        token: tokenId,
      });
    }
  }

  return paymentsWithTokens;
}
