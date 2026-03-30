import { processCollectionsInBatches } from '@/lib/collections/processCollectionsInBatches';
import { selectMaxUpdatedAt } from '@/lib/collections/selectMaxUpdatedAt';
import type { Sound_Editions_t } from '@/types/envio';
import type { IndexConfig } from '@/types/factory';

export const soundCollectionsIndexer: IndexConfig<Sound_Editions_t> = {
  processBatchFn: processCollectionsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'sound_collections',
  dataPath: 'Sound_Editions',
  queryFragment: `Sound_Editions(limit: $limit, offset: $offset_sound_collections, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_sound_collections}}) {
    id address name owner uri chain_id created_at updated_at transaction_hash
  }`,
};
