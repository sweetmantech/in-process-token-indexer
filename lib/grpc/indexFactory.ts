import type { PageInfo } from '@/types/envio';
import { toChainTimestamp } from '@/lib/toChainTimestamp';

interface IndexConfig<
  T,
  TQueryResult extends { entities: T[]; pageInfo: PageInfo },
> {
  queryFn: (params: {
    limit: number;
    offset: number;
    minTimestamp: number;
  }) => Promise<TQueryResult>;
  processBatchFn: (entities: T[]) => Promise<void>;
  selectMaxTimestampFn: () => Promise<number | null>;
  indexName: string;
}

/**
 * Factory function to create an index function for any entity type.
 * Handles pagination, incremental indexing, and batch processing.
 * @param config - Configuration object with query, process, and select functions.
 * @returns Index function that fetches and processes all entities.
 */
export function createIndexFunction<
  T,
  TQueryResult extends { entities: T[]; pageInfo: PageInfo },
>(config: IndexConfig<T, TQueryResult>) {
  return async function index(): Promise<T[]> {
    const allEntities: T[] = [];
    let offset = 0;
    const limit = 1000;
    let hasNextPage = true;

    // Get the latest timestamp from Supabase for incremental indexing
    const maxTimestampSupabase = await config.selectMaxTimestampFn();
    const minTimestampEnvio = toChainTimestamp(
      maxTimestampSupabase ?? new Date(0).getTime()
    );

    while (hasNextPage) {
      const { entities, pageInfo } = await config.queryFn({
        limit,
        offset,
        minTimestamp: minTimestampEnvio,
      });

      if (entities.length > 0) {
        console.log(
          `💾 Processing ${allEntities.length} ~ ${allEntities.length + entities.length} ${config.indexName}`
        );
      }

      // ℹ️ Process fetched entities for this page (batch upserts handled in processBatchFn)
      await config.processBatchFn(entities);

      hasNextPage = pageInfo.hasNextPage;
      offset = pageInfo.nextOffset;
      allEntities.push(...entities);
    }

    return allEntities;
  };
}
