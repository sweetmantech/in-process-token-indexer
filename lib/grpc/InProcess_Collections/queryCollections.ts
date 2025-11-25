import fetch from 'node-fetch';
import { GRPC_ENDPOINT } from '../../consts';
import type {
  InProcess_Collections_t,
  QueryResult,
} from '../../../types/envio';

const COLLECTIONS_QUERY = `query GetCollections($limit: Int, $offset: Int, $minUpdatedAt: Int) {
  InProcess_Collections(limit: $limit, offset: $offset, order_by: { updated_at: desc }, where: { updated_at: { _gt: $minUpdatedAt } }) {
    id address uri default_admin payout_recipient chain_id created_at updated_at transaction_hash
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Collections.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @returns Object containing collections and pagination info.
 */
export async function queryCollections({
  limit = 1000,
  offset = 0,
  minUpdatedAt,
}: {
  limit?: number;
  offset?: number;
  minUpdatedAt: number;
}): Promise<QueryResult> {
  try {
    const variables = { limit, offset, minUpdatedAt };

    const response = await fetch(GRPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: COLLECTIONS_QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as {
      errors?: unknown[];
      data?: {
        InProcess_Collections?: InProcess_Collections_t[];
      };
    };

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const collections = data.data?.InProcess_Collections || [];

    return {
      collections,
      pageInfo: {
        hasNextPage: collections.length === limit, // If we got a full batch, there might be more
        nextOffset: offset + limit,
      },
    };
  } catch (error) {
    console.error(`Error querying GraphQL endpoint:`, error);
    throw error;
  }
}
