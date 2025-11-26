import { INDEX_INTERVAL_MS } from '@/lib/consts';
import { sleep } from '@/lib/sleep';
import { toChainTimestamp } from '@/lib/toChainTimestamp';
import {
  IIndexFactory,
  IndexConfig,
  QueryFn,
  ProcessBatchFn,
  SelectMaxTimestampFn,
} from '@/types/factory';

/**
 * Factory class that handles indexing and continuous execution.
 * Combines pagination, incremental indexing, batch processing, and continuous loop execution.
 */
export class IndexFactory<T> implements IIndexFactory<T> {
  readonly queryFn: QueryFn<T>;
  readonly processBatchFn: ProcessBatchFn<T>;
  readonly selectMaxTimestampFn: SelectMaxTimestampFn;
  readonly indexName: string;

  constructor(config: IndexConfig<T>) {
    this.queryFn = config.queryFn;
    this.processBatchFn = config.processBatchFn;
    this.selectMaxTimestampFn = config.selectMaxTimestampFn;
    this.indexName = config.indexName;
  }

  /**
   * Fetches and processes all entities with pagination and incremental indexing.
   * @returns Array of all indexed entities.
   */
  async index(): Promise<T[]> {
    const allEntities: T[] = [];
    let offset = 0;
    const limit = 1000;
    let hasNextPage = true;

    // Get the latest timestamp from Supabase for incremental indexing
    const maxTimestampSupabase = await this.selectMaxTimestampFn();
    const minTimestampEnvio = toChainTimestamp(
      maxTimestampSupabase ?? new Date(0).getTime()
    );

    while (hasNextPage) {
      const { entities, pageInfo } = await this.queryFn({
        limit,
        offset,
        minTimestamp: minTimestampEnvio,
      });

      if (entities.length > 0) {
        console.log(
          `💻 Processing ${allEntities.length} ~ ${allEntities.length + entities.length} ${this.indexName}`
        );
      }

      // ℹ️ Process fetched entities for this page (batch upserts handled in processBatchFn)
      await this.processBatchFn(entities);

      hasNextPage = pageInfo.hasNextPage;
      offset = pageInfo.nextOffset;
      allEntities.push(...entities);
    }

    return allEntities;
  }

  /**
   * Runs indexing continuously in a loop with error handling and sleep intervals.
   */
  async execute(): Promise<void> {
    while (true) {
      try {
        const startTime = Date.now();

        console.log(`🔍 Indexing ${this.indexName}`);

        const entities = await this.index();

        if (entities)
          console.log(`📊 Indexed new ${entities.length} ${this.indexName}`);
        else console.log(`ℹ️  No new ${this.indexName} found`);

        const duration = Date.now() - startTime;
        console.log(`✅ Completed indexing ${this.indexName} (${duration}ms)`);

        // Wait before next iteration
        await sleep(INDEX_INTERVAL_MS);
      } catch (error) {
        console.error(`❌ Error in ${this.indexName} indexing cycle:`, error);
        // Wait before retrying even on error
        await sleep(INDEX_INTERVAL_MS);
      }
    }
  }
}
