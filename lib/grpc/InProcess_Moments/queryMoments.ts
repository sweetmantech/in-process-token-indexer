import { queryGraphQL } from '@/lib/grpc/queryGraphQL';
import type { InProcess_Moments_t, MomentsQueryResult } from '@/types/envio';

const MOMENTS_QUERY = `query GetInProcess_Moments($limit: Int, $offset: Int, $minTimestamp: Int) {
  InProcess_Moments(limit: $limit, offset: $offset, order_by: { updated_at: desc }, where: { updated_at: { _gt: $minTimestamp } }) {
    id collection token_id uri max_supply chain_id created_at updated_at transaction_hash
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Moments.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minTimestamp - Minimum updated_at timestamp to filter by (for incremental indexing).
 * @returns Object containing moments and pagination info.
 */
export async function queryMoments({
  limit = 1000,
  offset = 0,
  minTimestamp,
}: {
  limit?: number;
  offset?: number;
  minTimestamp: number;
}): Promise<MomentsQueryResult> {
  const result = await queryGraphQL<InProcess_Moments_t>({
    query: MOMENTS_QUERY,
    entityName: 'InProcess_Moments',
    variables: {
      limit,
      offset,
      minTimestamp,
    },
  });

  return result;
}
