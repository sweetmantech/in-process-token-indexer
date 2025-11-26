import { indexCollections } from '@/lib/grpc/InProcess_Collections/indexCollections';
import { createExecuteIndexFunction } from '@/lib/factories/executeIndexFactory';

/**
 * Indexes collections.
 * Runs continuously in a loop.
 */
export const executeCollectionsIndexing = createExecuteIndexFunction({
  indexFn: indexCollections,
  indexName: 'collections',
});
