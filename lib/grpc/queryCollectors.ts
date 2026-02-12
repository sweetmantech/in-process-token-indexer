import { queryGraphQL } from '@/lib/grpc/queryGraphQL';
import type {
  InProcess_Collectors_t,
  CollectorsQueryResult,
} from '@/types/envio';

const COLLECTORS_QUERY = `query GetInProcess_Collectors($limit: Int, $offset: Int, $minTimestamp: Int) {
  InProcess_Collectors(limit: $limit, offset: $offset, order_by: { collected_at: asc }, where: { collected_at: { _gt: $minTimestamp }}) {
    id collection token_id amount chain_id collector transaction_hash collected_at
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Collectors.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minTimestamp - Minimum collected_at timestamp to filter by (for incremental indexing).
 * @returns Object containing collectors and pagination info.
 */
export async function queryCollectors({
  limit = 1000,
  offset = 0,
  minTimestamp,
}: {
  limit?: number;
  offset?: number;
  minTimestamp: number;
}): Promise<CollectorsQueryResult> {
  const result = await queryGraphQL<InProcess_Collectors_t>({
    query: COLLECTORS_QUERY,
    dataPath: 'InProcess_Collectors',
    variables: {
      limit,
      offset,
      minTimestamp,
    },
  });

  return result;
}
