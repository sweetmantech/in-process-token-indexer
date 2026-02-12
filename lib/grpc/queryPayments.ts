import { queryGraphQL } from '@/lib/grpc/queryGraphQL';
import type { InProcess_Payments_t, PaymentsQueryResult } from '@/types/envio';

const PAYMENTS_QUERY = `query GetInProcess_Payments($limit: Int, $offset: Int, $minTimestamp: Int) {
  InProcess_Payments(limit: $limit, offset: $offset, order_by: { transferred_at: asc }, where: { transferred_at: { _gt: $minTimestamp }}) {
    id collection currency token_id recipient spender amount chain_id transaction_hash transferred_at
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Payments.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minTimestamp - Minimum transferred_at timestamp to filter by (for incremental indexing).
 * @returns Object containing payments and pagination info.
 */
export async function queryPayments({
  limit = 1000,
  offset = 0,
  minTimestamp,
}: {
  limit?: number;
  offset?: number;
  minTimestamp: number;
}): Promise<PaymentsQueryResult> {
  const result = await queryGraphQL<InProcess_Payments_t>({
    query: PAYMENTS_QUERY,
    dataPath: 'InProcess_Payments',
    variables: {
      limit,
      offset,
      minTimestamp,
    },
  });

  return result;
}
