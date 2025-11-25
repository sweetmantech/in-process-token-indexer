import { processMomentCommentsInBatches } from '../../../lib/momentComments/processMomentCommentsInBatches';
import type { InProcess_Moment_Comments_t } from '../../../types/envio';
import { selectMaxCommentedAt } from '../../supabase/in_process_moment_comments/selectMaxCommentedAt';
import { toChainTimestamp } from '../../utils/toChainTimestamp';
import { queryMomentComments } from './queryMomentComments';

/**
 * Fetches all moment comments from Envio GraphQL with pagination.
 * @returns Array of all moment comments.
 */
export async function indexMomentComments(): Promise<
  InProcess_Moment_Comments_t[]
> {
  const allComments: InProcess_Moment_Comments_t[] = [];
  let offset = 0;
  const limit = 1000;
  let hasNextPage = true;

  // Get the latest commented_at from in_process_moment_comments for incremental indexing
  const maxCommentedAtSupabase = await selectMaxCommentedAt();
  const minCommentedAtEnvio = toChainTimestamp(
    maxCommentedAtSupabase ?? new Date(0).getTime()
  );

  while (hasNextPage) {
    const commentsResult = await queryMomentComments({
      limit,
      offset,
      minCommentedAt: minCommentedAtEnvio,
    });

    if (commentsResult.momentComments.length > 0) {
      console.log(
        `💾 Processing ${allComments.length} ~ ${allComments.length + commentsResult.momentComments.length}`
      );
    }

    // ℹ️ Process fetched comments for this page (batch upserts handled in processMomentCommentsInBatches)
    await processMomentCommentsInBatches(commentsResult.momentComments);

    hasNextPage = commentsResult.pageInfo.hasNextPage;
    offset = commentsResult.pageInfo.nextOffset;
    allComments.push(...commentsResult.momentComments);
  }

  return allComments;
}
