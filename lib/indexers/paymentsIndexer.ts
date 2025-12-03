import { processPaymentsInBatches } from '@/lib/payments/processPaymentsInBatches';
import type { InProcess_ERC20RewardsDeposit_t } from '@/types/envio';
import { selectMaxTransferredAt } from '@/lib/payments/selectMaxTransferredAt';
import { IndexFactory } from '@/lib/indexers/IndexFactory';
import { queryPayments } from '@/lib/grpc/queryPayments';

export const paymentsIndexer =
  new IndexFactory<InProcess_ERC20RewardsDeposit_t>({
    queryFn: queryPayments,
    processBatchFn: processPaymentsInBatches,
    selectMaxTimestampFn: selectMaxTransferredAt,
    indexName: 'payments',
  });
