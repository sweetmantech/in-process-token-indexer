import { PageInfo } from './envio';

/**
 * Parameters for querying entities from Envio GraphQL.
 */
export interface QueryParams {
  limit: number;
  offset: number;
  minTimestamp: number;
}

/**
 * Result returned from querying entities.
 */
export interface QueryResult<T> {
  entities: T[];
  pageInfo: PageInfo;
}

/**
 * Function type for querying entities from Envio GraphQL.
 * @param params - Query parameters including limit, offset, and minTimestamp
 * @returns Promise resolving to entities and page info
 */
export type QueryFn<T> = (params: QueryParams) => Promise<QueryResult<T>>;

/**
 * Function type for processing a batch of entities (e.g., upserting to Supabase).
 * @param entities - Array of entities to process
 * @returns Promise that resolves when processing is complete
 */
export type ProcessBatchFn<T> = (entities: T[]) => Promise<void>;

/**
 * Function type for selecting the maximum timestamp from Supabase.
 * Used for incremental indexing to only fetch records updated since last sync.
 * @returns Promise resolving to maximum timestamp in milliseconds (epoch), or null if no records exist
 */
export type SelectMaxTimestampFn = () => Promise<number | null>;

/**
 * Configuration for creating an IndexFactory instance.
 */
export interface IndexConfig<T> {
  /** Function to query entities from Envio GraphQL */
  queryFn: QueryFn<T>;
  /** Function to process batches of entities (e.g., upsert to Supabase) */
  processBatchFn: ProcessBatchFn<T>;
  /** Function to get the maximum timestamp from Supabase for incremental indexing */
  selectMaxTimestampFn: SelectMaxTimestampFn;
  /** Name of the indexer (used for logging) */
  indexName: string;
}

/**
 * Interface for IndexFactory public API.
 */
export interface IIndexFactory<T> {
  /** Function to query entities from Envio GraphQL */
  readonly queryFn: QueryFn<T>;
  /** Function to process batches of entities (e.g., upsert to Supabase) */
  readonly processBatchFn: ProcessBatchFn<T>;
  /** Function to get the maximum timestamp from Supabase for incremental indexing */
  readonly selectMaxTimestampFn: SelectMaxTimestampFn;
  /** Name of the indexer (used for logging) */
  readonly indexName: string;

  /**
   * Fetches and processes all entities with pagination and incremental indexing.
   * @returns Array of all indexed entities.
   */
  index(): Promise<T[]>;

  /**
   * Runs indexing continuously in a loop with error handling and sleep intervals.
   */
  execute(): Promise<void>;
}
