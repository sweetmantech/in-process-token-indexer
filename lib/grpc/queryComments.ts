import { queryGraphQL } from '@/lib/grpc/queryGraphQL';
import type {
  InProcess_Moment_Comments_t,
  MomentCommentsQueryResult,
} from '@/types/envio';

const MOMENT_COMMENTS_QUERY = `query GetInProcess_Moment_Comments($limit: Int, $offset: Int, $minTimestamp: Int) {
  InProcess_Moment_Comments(limit: $limit, offset: $offset, order_by: { commented_at: asc }, where: { commented_at: { _gt: $minTimestamp }}) {
    id collection sender token_id comment chain_id commented_at transaction_hash
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Moment_Comments.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minTimestamp - Minimum commented_at timestamp to filter by (for incremental indexing).
 * @returns Object containing moment comments and pagination info.
 */
export async function queryComments({
  limit = 1000,
  offset = 0,
  minTimestamp,
}: {
  limit?: number;
  offset?: number;
  minTimestamp: number;
}): Promise<MomentCommentsQueryResult> {
  const result = await queryGraphQL<InProcess_Moment_Comments_t>({
    query: MOMENT_COMMENTS_QUERY,
    dataPath: 'InProcess_Moment_Comments',
    variables: {
      limit,
      offset,
      minTimestamp,
    },
  });

  return result;
}
