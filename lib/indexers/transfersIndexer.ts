import { processTransfersInBatches } from '@/lib/transfers/processTransfersInBatches';
import type { Transfers_t } from '@/types/envio';
import { selectMaxTransferredAt } from '@/lib/transfers/selectMaxTransferredAt';
import type { IndexConfig } from '@/types/factory';

export const transfersIndexer: IndexConfig<Transfers_t> = {
  processBatchFn: processTransfersInBatches,
  selectMaxTimestampFn: selectMaxTransferredAt,
  indexName: 'transfers',
  dataPath: 'Transfers',
  queryFragment: `Transfers(limit: $limit, offset: $offset_transfers, order_by: {transferred_at: asc}, where: {transferred_at: {_gt: $minTimestamp_transfers}}) {
    id collection token_id chain_id recipient quantity payer value currency funds_recipient transaction_hash transferred_at
  }`,
};
