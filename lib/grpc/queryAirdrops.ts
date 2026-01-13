import { queryGraphQL } from '@/lib/grpc/queryGraphQL';
import type { InProcess_Airdrops_t, AirdropsQueryResult } from '@/types/envio';

const AIRDROPS_QUERY = `query GetInProcess_Airdrops($limit: Int, $offset: Int, $minTimestamp: Int) {
  InProcess_Airdrops(limit: $limit, offset: $offset, order_by: { updated_at: desc }, where: { updated_at: { _gt: $minTimestamp }}) {
    id recipient collection token_id amount chain_id updated_at
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Airdrops.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minTimestamp - Minimum updated_at timestamp to filter by (for incremental indexing).
 * @returns Object containing airdrops and pagination info.
 */
export async function queryAirdrops({
  limit = 1000,
  offset = 0,
  minTimestamp,
}: {
  limit?: number;
  offset?: number;
  minTimestamp: number;
}): Promise<AirdropsQueryResult> {
  const result = await queryGraphQL<InProcess_Airdrops_t>({
    query: AIRDROPS_QUERY,
    dataPath: 'InProcess_Airdrops',
    variables: {
      limit,
      offset,
      minTimestamp,
    },
  });

  return result;
}
