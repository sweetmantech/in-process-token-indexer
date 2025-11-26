import { indexMoments } from '@/lib/grpc/InProcess_Moments/indexMoments';
import { createExecuteIndexFunction } from '@/lib/factories/executeIndexFactory';
import { InProcess_Moments_t } from '@/types/envio';

/**
 * Indexes moments.
 * Runs continuously in a loop.
 */
export const executeMomentsIndexing =
  createExecuteIndexFunction<InProcess_Moments_t>({
    indexFn: indexMoments,
    indexName: 'moments',
  });
