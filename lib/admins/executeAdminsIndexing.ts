import { indexAdmins } from '@/lib/grpc/InProcess_Admins/indexAdmins';
import { createExecuteIndexFunction } from '@/lib/factories/executeIndexFactory';

/**
 * Indexes admins using granted_at for incremental indexing.
 * Runs continuously in a loop.
 */
export const executeAdminsIndexing = createExecuteIndexFunction({
  indexFn: indexAdmins,
  indexName: 'admins',
});
