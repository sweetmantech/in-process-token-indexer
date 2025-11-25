import fetch from 'node-fetch';
import { GRPC_ENDPOINT } from '../../consts';
import type {
  InProcess_Moment_Admins_t,
  MomentAdminsQueryResult,
} from '../../../types/envio';

const MOMENT_ADMINS_QUERY = `query GetMomentAdmins($limit: Int, $offset: Int, $minGrantedAt: Int) {
  InProcess_Moment_Admins(limit: $limit, offset: $offset, order_by: { granted_at: desc }, where: { granted_at: { _gt: $minGrantedAt }}) {
    id admin collection token_id chain_id granted_at
  }
}`;

/**
 * Queries Envio GraphQL for InProcess_Moment_Admins.
 * @param limit - Number of records to fetch per request (default: 1000).
 * @param offset - Number of records to skip (default: 0).
 * @param minGrantedAt - Minimum granted_at timestamp to filter by (for incremental indexing).
 * @returns Object containing moment admins and pagination info.
 */
export async function queryMomentAdmins({
  limit = 1000,
  offset = 0,
  minGrantedAt,
}: {
  limit?: number;
  offset?: number;
  minGrantedAt: number;
}): Promise<MomentAdminsQueryResult> {
  try {
    const variables = { limit, offset, minGrantedAt };

    const response = await fetch(GRPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: MOMENT_ADMINS_QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as {
      errors?: unknown[];
      data?: {
        InProcess_Moment_Admins?: InProcess_Moment_Admins_t[];
      };
    };

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const momentAdmins = data.data?.InProcess_Moment_Admins || [];

    return {
      momentAdmins,
      pageInfo: {
        hasNextPage: momentAdmins.length === limit,
        nextOffset: offset + limit,
      },
    };
  } catch (error) {
    console.error(`❌ Error querying GraphQL endpoint:`, error);
    throw error;
  }
}
