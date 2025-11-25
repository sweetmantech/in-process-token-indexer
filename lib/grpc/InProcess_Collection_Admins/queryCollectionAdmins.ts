import fetch from 'node-fetch';
import { GRPC_ENDPOINT } from '../../consts';
import type {
  InProcess_Collection_Admins_t,
  CollectionAdminsQueryResult,
} from '../../../types/envio';

const COLLECTION_ADMINS_QUERY = `query GetCollectionAdmins($limit: Int, $offset: Int, $minGrantedAt: Int) {
  InProcess_Collection_Admins(limit: $limit, offset: $offset, order_by: { granted_at: desc }, where: { granted_at: { _gt: $minGrantedAt }}) {
    id admin collection chain_id granted_at
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Collection_Admins.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minGrantedAt - Minimum granted_at timestamp to filter by (for incremental indexing).
 * @returns Object containing collection admins and pagination info.
 */
export async function queryCollectionAdmins({
  limit = 1000,
  offset = 0,
  minGrantedAt,
}: {
  limit?: number;
  offset?: number;
  minGrantedAt: number;
}): Promise<CollectionAdminsQueryResult> {
  try {
    const variables = { limit, offset, minGrantedAt };

    const response = await fetch(GRPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: COLLECTION_ADMINS_QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as {
      errors?: unknown[];
      data?: {
        InProcess_Collection_Admins?: InProcess_Collection_Admins_t[];
      };
    };

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const collectionAdmins = data.data?.InProcess_Collection_Admins || [];

    return {
      collectionAdmins,
      pageInfo: {
        hasNextPage: collectionAdmins.length === limit,
        nextOffset: offset + limit,
      },
    };
  } catch (error) {
    console.error(`❌ Error querying GraphQL endpoint:`, error);
    throw error;
  }
}
