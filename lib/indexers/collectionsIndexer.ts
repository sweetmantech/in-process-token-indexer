import { processCollectionsInBatches } from '@/lib/collections/processCollectionsInBatches';
import { selectMaxUpdatedAt } from '@/lib/collections/selectMaxUpdatedAt';
import type { InProcess_Collections_t } from '@/types/envio';
import type { IndexConfig } from '@/types/factory';

export const collectionsIndexer: IndexConfig<InProcess_Collections_t> = {
  processBatchFn: processCollectionsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'collections',
  dataPath: 'InProcess_Collections',
  queryFragment: `InProcess_Collections(limit: $limit, offset: $offset_collections, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_collections}}) {
    id address name uri default_admin payout_recipient chain_id created_at updated_at transaction_hash
  }`,
};
