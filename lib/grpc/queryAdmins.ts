import { queryGraphQL } from '@/lib/grpc/queryGraphQL';
import type { InProcess_Admins_t, AdminsQueryResult } from '@/types/envio';

const ADMINS_QUERY = `query GetInProcess_Admins($limit: Int, $offset: Int, $minTimestamp: Int) {
  InProcess_Admins(limit: $limit, offset: $offset, order_by: { granted_at: desc }, where: { granted_at: { _gt: $minTimestamp }}) {
    id admin collection token_id chain_id granted_at
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Admins.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minTimestamp - Minimum granted_at timestamp to filter by (for incremental indexing).
 * @returns Object containing admins and pagination info.
 */
export async function queryAdmins({
  limit = 1000,
  offset = 0,
  minTimestamp,
}: {
  limit?: number;
  offset?: number;
  minTimestamp: number;
}): Promise<AdminsQueryResult> {
  const result = await queryGraphQL<InProcess_Admins_t>({
    query: ADMINS_QUERY,
    dataPath: 'InProcess_Admins',
    variables: {
      limit,
      offset,
      minTimestamp,
    },
  });
  return result;
}
