import { indexComments } from '@/lib/grpc/InProcess_Moment_Comments/indexComments';
import { createExecuteIndexFunction } from '@/lib/factories/executeIndexFactory';
import { InProcess_Moment_Comments_t } from '@/types/envio';

/**
 * Indexes moment comments using commented_at for incremental indexing.
 * Runs continuously in a loop.
 */
export const executeCommentsIndexing =
  createExecuteIndexFunction<InProcess_Moment_Comments_t>({
    indexFn: indexComments,
    indexName: 'comments',
  });
