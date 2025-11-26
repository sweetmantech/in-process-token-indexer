import { processCommentsInBatches } from '@/lib/comments/processCommentsInBatches';
import type { InProcess_Moment_Comments_t } from '@/types/envio';
import { selectMaxCommentedAt } from '@/lib/comments/selectMaxCommentedAt';
import { IndexFactory } from '@/lib/indexers/IndexFactory';
import { queryComments } from '@/lib/grpc/queryComments';

export const commentsIndexer = new IndexFactory<InProcess_Moment_Comments_t>({
  queryFn: queryComments,
  processBatchFn: processCommentsInBatches,
  selectMaxTimestampFn: selectMaxCommentedAt,
  indexName: 'comments',
});
