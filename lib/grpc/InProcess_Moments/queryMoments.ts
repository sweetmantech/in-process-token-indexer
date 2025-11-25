import fetch from 'node-fetch';
import { GRPC_ENDPOINT } from '../../consts';
import type {
  InProcess_Moments_t,
  MomentsQueryResult,
} from '../../../types/envio';

const MOMENTS_QUERY = `query GetMoments($limit: Int, $offset: Int, $minUpdatedAt: Int) {
  InProcess_Moments(limit: $limit, offset: $offset, order_by: { updated_at: desc }, where: { updated_at: { _gt: $minUpdatedAt } }) {
    id collection token_id uri max_supply chain_id created_at updated_at transaction_hash
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Moments.
 * @param chainId - Chain ID to filter by (required).
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minUpdatedAt - Minimum updated_at timestamp to filter by (for incremental indexing).
 * @returns Object containing moments and pagination info.
 */
export async function queryMoments({
  limit = 1000,
  offset = 0,
  minUpdatedAt,
}: {
  limit?: number;
  offset?: number;
  minUpdatedAt: number;
}): Promise<MomentsQueryResult> {
  try {
    const variables = { limit, offset, minUpdatedAt };

    const response = await fetch(GRPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: MOMENTS_QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as {
      errors?: unknown[];
      data?: {
        InProcess_Moments?: InProcess_Moments_t[];
      };
    };

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const moments = data.data?.InProcess_Moments || [];

    return {
      moments,
      pageInfo: {
        hasNextPage: moments.length === limit, // If we got a full batch, there might be more
        nextOffset: offset + limit,
      },
    };
  } catch (error) {
    console.error(`❌ Error querying GraphQL endpoint:`, error);
    throw error;
  }
}
