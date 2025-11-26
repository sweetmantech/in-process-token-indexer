import { indexComments } from '@/lib/grpc/InProcess_Moment_Comments/indexComments';
import { createExecuteIndexFunction } from '@/lib/factories/executeIndexFactory';

/**
 * Indexes moment comments using commented_at for incremental indexing.
 * Runs continuously in a loop.
 */
export const executeCommentsIndexing = createExecuteIndexFunction({
  indexFn: indexComments,
  indexName: 'comments',
});
