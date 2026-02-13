import { processPaymentsInBatches } from '@/lib/payments/processPaymentsInBatches';
import type { InProcess_Payments_t } from '@/types/envio';
import { selectMaxTransferredAt } from '@/lib/payments/selectMaxTransferredAt';
import type { IndexConfig } from '@/types/factory';

export const paymentsIndexer: IndexConfig<InProcess_Payments_t> = {
  processBatchFn: processPaymentsInBatches,
  selectMaxTimestampFn: selectMaxTransferredAt,
  indexName: 'payments',
  dataPath: 'InProcess_Payments',
  queryFragment: `InProcess_Payments(limit: $limit, offset: $offset_payments, order_by: {transferred_at: asc}, where: {transferred_at: {_gt: $minTimestamp_payments}}) {
    id collection currency token_id recipient spender amount chain_id transaction_hash transferred_at
  }`,
};
