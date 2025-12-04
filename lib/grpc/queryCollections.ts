import { queryGraphQL } from '@/lib/grpc/queryGraphQL';
import type {
  InProcess_Collections_t,
  CollectionsQueryResult,
} from '@/types/envio';

const COLLECTIONS_QUERY = `query GetInProcess_Collections($limit: Int, $offset: Int, $minTimestamp: Int) {
  InProcess_Collections(limit: $limit, offset: $offset, order_by: { updated_at: desc }, where: { updated_at: { _gt: $minTimestamp } }) {
    id address name uri default_admin payout_recipient chain_id created_at updated_at transaction_hash
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Collections.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minTimestamp - Minimum updated_at timestamp to filter by (for incremental indexing).
 * @returns Object containing collections and pagination info.
 */
export async function queryCollections({
  limit = 1000,
  offset = 0,
  minTimestamp,
}: {
  limit?: number;
  offset?: number;
  minTimestamp: number;
}): Promise<CollectionsQueryResult> {
  const result = await queryGraphQL<InProcess_Collections_t>({
    query: COLLECTIONS_QUERY,
    dataPath: 'InProcess_Collections',
    variables: {
      limit,
      offset,
      minTimestamp,
    },
  });

  return result;
}
