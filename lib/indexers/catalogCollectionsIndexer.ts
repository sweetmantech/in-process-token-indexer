import { processCatalogCollectionsInBatches } from '@/lib/catalog_collections/processCatalogCollectionsInBatches';
import { selectMaxUpdatedAt } from '@/lib/collections/selectMaxUpdatedAt';
import type { Catalog_Collections_t } from '@/types/envio';
import type { IndexConfig } from '@/types/factory';

export const catalogCollectionsIndexer: IndexConfig<Catalog_Collections_t> = {
  processBatchFn: processCatalogCollectionsInBatches,
  selectMaxTimestampFn: selectMaxUpdatedAt,
  indexName: 'catalog_collections',
  dataPath: 'Catalog_Collections',
  queryFragment: `Catalog_Collections(limit: $limit, offset: $offset_catalog_collections, order_by: {updated_at: asc}, where: {updated_at: {_gt: $minTimestamp_catalog_collections}}) {
    id address name creator uri chain_id created_at updated_at transaction_hash
  }`,
};
