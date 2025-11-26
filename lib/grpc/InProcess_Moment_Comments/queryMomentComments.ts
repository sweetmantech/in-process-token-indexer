import fetch from 'node-fetch';
import { GRPC_ENDPOINT } from '@/lib/consts';
import type {
  InProcess_Moment_Comments_t,
  MomentCommentsQueryResult,
} from '@/types/envio';

const MOMENT_COMMENTS_QUERY = `query GetMomentComments($limit: Int, $offset: Int, $minCommentedAt: Int) {
  InProcess_Moment_Comments(limit: $limit, offset: $offset, order_by: { commented_at: desc }, where: { commented_at: { _gt: $minCommentedAt }}) {
    id collection sender token_id comment chain_id commented_at transaction_hash
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Moment_Comments.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minCommentedAt - Minimum commented_at timestamp to filter by (for incremental indexing).
 * @returns Object containing moment comments and pagination info.
 */
export async function queryMomentComments({
  limit = 1000,
  offset = 0,
  minCommentedAt,
}: {
  limit?: number;
  offset?: number;
  minCommentedAt: number;
}): Promise<MomentCommentsQueryResult> {
  try {
    const variables = { limit, offset, minCommentedAt };

    const response = await fetch(GRPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: MOMENT_COMMENTS_QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as {
      errors?: unknown[];
      data?: {
        InProcess_Moment_Comments?: InProcess_Moment_Comments_t[];
      };
    };

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const momentComments = data.data?.InProcess_Moment_Comments || [];

    return {
      momentComments,
      pageInfo: {
        hasNextPage: momentComments.length === limit,
        nextOffset: offset + limit,
      },
    };
  } catch (error) {
    console.error(`❌ Error querying GraphQL endpoint:`, error);
    throw error;
  }
}
