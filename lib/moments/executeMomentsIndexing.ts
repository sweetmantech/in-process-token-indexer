import { indexMoments } from '@/lib/grpc/InProcess_Moments/indexMoments';
import { createExecuteIndexFunction } from '@/lib/factories/executeIndexFactory';

/**
 * Indexes moments.
 * Runs continuously in a loop.
 */
export const executeMomentsIndexing = createExecuteIndexFunction({
  indexFn: indexMoments,
  indexName: 'moments',
});
