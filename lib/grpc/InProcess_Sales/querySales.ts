import fetch from 'node-fetch';
import { GRPC_ENDPOINT } from '@/lib/consts';
import type { InProcess_Sales_t, SalesQueryResult } from '@/types/envio';

const SALES_QUERY = `query GetSales($limit: Int, $offset: Int, $minCreatedAt: Int) {
  InProcess_Sales(limit: $limit, offset: $offset, order_by: { created_at: desc }, where: { created_at: { _gt: $minCreatedAt }}) {
    id collection token_id sale_start sale_end max_tokens_per_address price_per_token funds_recipient currency chain_id transaction_hash created_at
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Sales.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minCreatedAt - Minimum created_at timestamp to filter by (for incremental indexing).
 * @returns Object containing sales and pagination info.
 */
export async function querySales({
  limit = 1000,
  offset = 0,
  minCreatedAt,
}: {
  limit?: number;
  offset?: number;
  minCreatedAt: number;
}): Promise<SalesQueryResult> {
  try {
    const variables = { limit, offset, minCreatedAt };

    const response = await fetch(GRPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: SALES_QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as {
      errors?: unknown[];
      data?: {
        InProcess_Sales?: InProcess_Sales_t[];
      };
    };

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const sales = data.data?.InProcess_Sales || [];

    return {
      sales,
      pageInfo: {
        hasNextPage: sales.length === limit,
        nextOffset: offset + limit,
      },
    };
  } catch (error) {
    console.error(`❌ Error querying GraphQL endpoint:`, error);
    throw error;
  }
}
