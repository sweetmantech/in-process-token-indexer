import { queryGraphQL } from '@/lib/grpc/queryGraphQL';
import type { InProcess_Sales_t, SalesQueryResult } from '@/types/envio';

const SALES_QUERY = `query GetInProcess_Sales($limit: Int, $offset: Int, $minTimestamp: Int) {
  InProcess_Sales(limit: $limit, offset: $offset, order_by: { created_at: desc }, where: { created_at: { _gt: $minTimestamp }}) {
    id collection token_id sale_start sale_end max_tokens_per_address price_per_token funds_recipient currency chain_id transaction_hash created_at
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Sales.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minTimestamp - Minimum created_at timestamp to filter by (for incremental indexing).
 * @returns Object containing sales and pagination info.
 */
export async function querySales({
  limit = 1000,
  offset = 0,
  minTimestamp,
}: {
  limit?: number;
  offset?: number;
  minTimestamp: number;
}): Promise<SalesQueryResult> {
  const result = await queryGraphQL<InProcess_Sales_t>({
    query: SALES_QUERY,
    entityName: 'InProcess_Sales',
    variables: {
      limit,
      offset,
      minTimestamp,
    },
  });

  return result;
}
