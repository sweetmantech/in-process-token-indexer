/**
 * Function type for processing a batch of entities (e.g., upserting to Supabase).
 */
export type ProcessBatchFn<T> = (entities: T[]) => Promise<void>;

/**
 * Function type for selecting the maximum timestamp from Supabase.
 * Used for incremental indexing to only fetch records updated since last sync.
 * @returns Promise resolving to maximum timestamp in milliseconds (epoch), or null if no records exist
 */
export type SelectMaxTimestampFn = () => Promise<number | null>;

/**
 * Configuration for an indexer.
 */
export interface IndexConfig<T> {
  /** Function to process batches of entities (e.g., upsert to Supabase) */
  processBatchFn: ProcessBatchFn<T>;
  /** Function to get the maximum timestamp from Supabase for incremental indexing */
  selectMaxTimestampFn: SelectMaxTimestampFn;
  /** Name of the indexer (used for logging and timestamp keys) */
  indexName: string;
  /** GraphQL root field name in the combined query response */
  dataPath: string;
  /** GraphQL query body fragment for this entity (uses $limit, $offset_<name>, $minTimestamp_<name>) */
  queryFragment: string;
}
