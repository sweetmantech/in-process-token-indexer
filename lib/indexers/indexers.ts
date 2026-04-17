import { catalogAdminsIndexer } from '@/lib/indexers/catalogAdminsIndexer';
import { catalogCollectionsIndexer } from '@/lib/indexers/catalogCollectionsIndexer';
import { catalogMomentsIndexer } from '@/lib/indexers/catalogMomentsIndexer';
import { collectionsIndexer } from '@/lib/indexers/collectionsIndexer';
import { momentsIndexer } from '@/lib/indexers/momentsIndexer';
import { adminsIndexer } from '@/lib/indexers/adminsIndexer';
import { commentsIndexer } from '@/lib/indexers/commentsIndexer';
import { salesIndexer } from '@/lib/indexers/salesIndexer';
import { transfersIndexer } from '@/lib/indexers/transfersIndexer';
import { soundEditionsIndexer } from '@/lib/indexers/soundEditionsIndexer';
import { soundMomentsIndexer } from '@/lib/indexers/soundMomentsIndexer';
import { soundAdminsIndexer } from '@/lib/indexers/soundAdminsIndexer';
import { zoraMomentsIndexer } from '@/lib/indexers/zoraMomentsIndexer';
import { zoraAdminsIndexer } from '@/lib/indexers/zoraAdminsIndexer';
import type { IndexConfig } from '@/types/factory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const indexers: IndexConfig<any>[] = [
  // // collections
  // collectionsIndexer,
  // catalogCollectionsIndexer,
  // soundEditionsIndexer,
  // // moments
  // soundMomentsIndexer,
  // momentsIndexer,
  // catalogMomentsIndexer,
  // // admins
  // adminsIndexer,
  // catalogAdminsIndexer,
  // soundAdminsIndexer,

  // commentsIndexer,
  // salesIndexer,
  transfersIndexer,

  // zoraMomentsIndexer,
  // zoraAdminsIndexer,
];
