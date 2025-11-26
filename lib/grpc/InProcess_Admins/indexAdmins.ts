import { processAdminsInBatches } from '@/lib/admins/processAdminsInBatches';
import type { InProcess_Admins_t } from '@/types/envio';
import { selectMaxGrantedAt } from '@/lib/admins/selectMaxGrantedAt';
import { createIndexFunction } from '@/lib/factories/indexFactory';
import { queryAdmins } from './queryAdmins';

/**
 * Fetches all admins from Envio GraphQL with pagination.
 * @returns Array of all admins.
 */
export const indexAdmins = createIndexFunction<InProcess_Admins_t>({
  queryFn: queryAdmins,
  processBatchFn: processAdminsInBatches,
  selectMaxTimestampFn: selectMaxGrantedAt,
  indexName: 'admins',
});
