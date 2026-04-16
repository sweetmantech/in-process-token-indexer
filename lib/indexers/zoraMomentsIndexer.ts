import { processMomentsInBatches } from '@/lib/moments/processMomentsInBatches';
import { selectMaxUpdatedAt } from '@/lib/moments/selectMaxUpdatedAt';
import type { ZoraMedia_Moments_t } from '@/types/envio';
import type { IndexConfig } from '@/types/factory';
import zoraMissing from './zoraMissing.json';

const ZORA_MISSING_TOKEN_IDS = new Set<string>(
  zoraMissing.map(m => m.token_id)
);

const processZoraMomentsInBatches = (moments: ZoraMedia_Moments_t[]) =>
  processMomentsInBatches(moments, ZORA_MISSING_TOKEN_IDS);

export const zoraMomentsIndexer: IndexConfig<ZoraMedia_Moments_t> = {
  processBatchFn: processZoraMomentsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'zoraMoments',
  dataPath: 'ZoraMedia_Moments',
  queryFragment: `ZoraMedia_Moments(limit: $limit, offset: $offset_zoraMoments, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_zoraMoments}}) {
    id collection token_id owner uri metadata_uri chain_id created_at updated_at transaction_hash
  }`,
};
