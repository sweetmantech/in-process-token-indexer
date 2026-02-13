import { collectionsIndexer } from '@/lib/indexers/collectionsIndexer';
import { momentsIndexer } from '@/lib/indexers/momentsIndexer';
import { adminsIndexer } from '@/lib/indexers/adminsIndexer';
import { commentsIndexer } from '@/lib/indexers/commentsIndexer';
import { salesIndexer } from '@/lib/indexers/salesIndexer';
import { paymentsIndexer } from '@/lib/indexers/paymentsIndexer';
import { airdropsIndexer } from '@/lib/indexers/airdropsIndexer';
import { collectorsIndexer } from '@/lib/indexers/collectorsIndexer';
import type { IndexConfig } from '@/types/factory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const indexers: IndexConfig<any>[] = [
  collectionsIndexer,
  momentsIndexer,
  adminsIndexer,
  commentsIndexer,
  salesIndexer,
  paymentsIndexer,
  airdropsIndexer,
  collectorsIndexer,
];
