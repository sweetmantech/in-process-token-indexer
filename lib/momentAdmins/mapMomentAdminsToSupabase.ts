import toSupabaseTimestamp from '../utils/toSupabaseTimestamp';
import { InProcess_Moment_Admins_t } from '../../types/envio';
import { Database } from '../supabase/types';
import { getMomentIdMap } from './getMomentIdMap';

/**
 * Maps Envio InProcess_Moment_Admins_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Skips admins whose (collection, chain_id, token_id) cannot be resolved to a moment ID.
 * - Maps admin address to artist_address.
 * - Converts granted_at from chain timestamp to ISO timestamp.
 *
 * @param momentAdmins - Array of InProcess_Moment_Admins_t from Envio.
 * @returns Promise of objects formatted for Supabase upsert.
 */
export async function mapMomentAdminsToSupabase(
  momentAdmins: InProcess_Moment_Admins_t[]
): Promise<
  Database['public']['Tables']['in_process_moment_admins']['Insert'][]
> {
  const mappedAdmins: Array<
    Database['public']['Tables']['in_process_moment_admins']['Insert']
  > = [];

  const momentIdMap = await getMomentIdMap(momentAdmins);

  for (const admin of momentAdmins) {
    const tripletKey = `${admin.collection.toLowerCase()}:${admin.chain_id}:${admin.token_id}`;
    const momentId = momentIdMap.get(tripletKey);
    if (momentId) {
      mappedAdmins.push({
        moment: momentId,
        artist_address: admin.admin.toLowerCase(),
        granted_at: toSupabaseTimestamp(admin.granted_at),
      });
    }
  }

  return mappedAdmins;
}
