import fetch from 'node-fetch';
import { GRPC_ENDPOINT } from '@/lib/consts';
import type { PageInfo } from '@/types/envio';

export interface GraphQLQueryParams {
  query: string;
  entityName: string;
  variables: Record<string, unknown>;
}

/**
 * Generic function to query Envio GraphQL for any entity.
 * @param params - Query parameters including query string, entity name, and variables.
 * @returns Object containing entities array and pagination info.
 */
export async function queryGraphQL<T>({
  query,
  entityName,
  variables,
}: GraphQLQueryParams): Promise<{ entities: T[]; pageInfo: PageInfo }> {
  const limit = (variables.limit as number) ?? 1000;
  const offset = (variables.offset as number) ?? 0;

  try {
    const response = await fetch(GRPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as {
      errors?: unknown[];
      data?: {
        [key: string]: T[];
      };
    };

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const entities = data.data?.[entityName] || [];

    return {
      entities,
      pageInfo: {
        hasNextPage: entities.length === limit,
        nextOffset: offset + limit,
      },
    };
  } catch (error) {
    console.error(`❌ Error querying GraphQL endpoint:`, error);
    throw error;
  }
}
