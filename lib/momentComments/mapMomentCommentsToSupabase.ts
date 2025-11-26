import toSupabaseTimestamp from '../utils/toSupabaseTimestamp';
import {
  InProcess_Moment_Comments_t,
  InProcess_Moment_Admins_t,
} from '../../types/envio';
import { Database } from '../supabase/types';
import { getMomentIdMap } from '../moments/getMomentIdMap';

/**
 * Maps Envio InProcess_Moment_Comments_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Skips comments whose (collection, chain_id, token_id) cannot be resolved to a moment ID.
 * - Maps sender address to artist_address.
 * - Converts commented_at from chain timestamp to ISO timestamp.
 *
 * @param momentComments - Array of InProcess_Moment_Comments_t from Envio.
 * @returns Promise of objects formatted for Supabase upsert.
 */
export async function mapMomentCommentsToSupabase(
  momentComments: InProcess_Moment_Comments_t[]
): Promise<
  Database['public']['Tables']['in_process_moment_comments']['Insert'][]
> {
  const mappedComments: Array<
    Database['public']['Tables']['in_process_moment_comments']['Insert']
  > = [];

  const momentIdMap = await getMomentIdMap(momentComments);

  for (const comment of momentComments) {
    const tripletKey = `${comment.collection.toLowerCase()}:${comment.chain_id}:${comment.token_id}`;
    const momentId = momentIdMap.get(tripletKey);
    if (momentId) {
      mappedComments.push({
        moment: momentId,
        artist_address: comment.sender.toLowerCase(),
        comment: comment.comment ?? null,
        commented_at: toSupabaseTimestamp(comment.commented_at),
      });
    }
  }

  return mappedComments;
}
