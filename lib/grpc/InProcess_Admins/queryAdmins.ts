import fetch from 'node-fetch';
import { GRPC_ENDPOINT } from '../../consts';
import type {
  InProcess_Admins_t,
  AdminsQueryResult,
} from '../../../types/envio';

const ADMINS_QUERY = `query GetAdmins($limit: Int, $offset: Int, $minGrantedAt: Int) {
  InProcess_Admins(limit: $limit, offset: $offset, order_by: { granted_at: desc }, where: { granted_at: { _gt: $minGrantedAt }}) {
    id admin collection token_id chain_id granted_at
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Admins.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minGrantedAt - Minimum granted_at timestamp to filter by (for incremental indexing).
 * @returns Object containing admins and pagination info.
 */
export async function queryAdmins({
  limit = 1000,
  offset = 0,
  minGrantedAt,
}: {
  limit?: number;
  offset?: number;
  minGrantedAt: number;
}): Promise<AdminsQueryResult> {
  try {
    const variables = { limit, offset, minGrantedAt };

    const response = await fetch(GRPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: ADMINS_QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as {
      errors?: unknown[];
      data?: {
        InProcess_Admins?: InProcess_Admins_t[];
      };
    };

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const admins = data.data?.InProcess_Admins || [];

    return {
      admins,
      pageInfo: {
        hasNextPage: admins.length === limit,
        nextOffset: offset + limit,
      },
    };
  } catch (error) {
    console.error(`❌ Error querying GraphQL endpoint:`, error);
    throw error;
  }
}
