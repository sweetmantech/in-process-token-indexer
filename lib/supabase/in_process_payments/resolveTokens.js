import { supabase } from "../client.js";

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
      const { data: tokens, error } = await supabase
        .from("in_process_tokens")
        .select("id, address")
        .or(
          `address.eq.${
            payment.collection || payment.currency
          }, address.ilike.%${payment.collection || payment.currency}%`
        )
        .limit(1);

      if (!error && tokens && tokens.length > 0) {
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
