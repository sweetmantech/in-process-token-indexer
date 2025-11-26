import { processCommentsInBatches } from '@/lib/comments/processCommentsInBatches';
import type { InProcess_Moment_Comments_t } from '@/types/envio';
import { selectMaxCommentedAt } from '@/lib/comments/selectMaxCommentedAt';
import { createIndexFunction } from '@/lib/factories/indexFactory';
import { queryComments } from './queryComments';

/**
 * Fetches all moment comments from Envio GraphQL with pagination.
 * @returns Array of all moment comments.
 */
export const indexComments = createIndexFunction<InProcess_Moment_Comments_t>({
  queryFn: queryComments,
  processBatchFn: processCommentsInBatches,
  selectMaxTimestampFn: selectMaxCommentedAt,
  indexName: 'comments',
});
