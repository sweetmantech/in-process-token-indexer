import { selectTokens } from '../supabase/in_process_tokens/selectTokens.js';

interface PaymentWithCollection {
  collection?: string;
  currency?: string;
  [key: string]: unknown;
}

interface TokenRecord {
  id: string;
  address: string;
  [key: string]: unknown;
}

interface PaymentWithToken extends PaymentWithCollection {
  token: string | null;
}

/**
 * Resolves token IDs for payments based on collection or currency
 * @param payments - Array of payment objects with collection/currency info
 * @returns Payments with resolved token IDs
 */
export async function resolveTokensForPayments(
  payments: PaymentWithCollection[]
): Promise<PaymentWithToken[]> {
  const paymentsWithTokens: PaymentWithToken[] = [];

  for (const payment of payments) {
    let tokenId: string | null = null;

    // Try to find matching token by collection or currency
    if (payment.collection || payment.currency) {
      const addresses = [payment.collection, payment.currency].filter(
        Boolean
      ) as string[];
      const tokens = (await selectTokens({
        addresses,
        fields: 'id, address',
      })) as TokenRecord[];

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
