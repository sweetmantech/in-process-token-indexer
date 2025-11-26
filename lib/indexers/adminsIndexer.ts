import { processAdminsInBatches } from '@/lib/admins/processAdminsInBatches';
import type { InProcess_Admins_t } from '@/types/envio';
import { selectMaxGrantedAt } from '@/lib/admins/selectMaxGrantedAt';
import { IndexFactory } from '@/lib/indexers/IndexFactory';
import { queryAdmins } from '@/lib/grpc/queryAdmins';

export const adminsIndexer = new IndexFactory<InProcess_Admins_t>({
  queryFn: queryAdmins,
  processBatchFn: processAdminsInBatches,
  selectMaxTimestampFn: selectMaxGrantedAt,
  indexName: 'admins',
});
