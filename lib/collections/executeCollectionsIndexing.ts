import { indexCollections } from '@/lib/grpc/InProcess_Collections/indexCollections';
import { createExecuteIndexFunction } from '@/lib/factories/executeIndexFactory';
import { InProcess_Collections_t } from '@/types/envio';

/**
 * Indexes collections.
 * Runs continuously in a loop.
 */
export const executeCollectionsIndexing =
  createExecuteIndexFunction<InProcess_Collections_t>({
    indexFn: indexCollections,
    indexName: 'collections',
  });
