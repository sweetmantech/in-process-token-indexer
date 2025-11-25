import toSupabaseTimestamp from '../utils/toSupabaseTimestamp';
import { InProcess_Moment_Admins_t } from '../../types/envio';
import { Database } from '../supabase/types';
import { getMomentIdMap } from '../supabase/in_process_moments/getMomentIdMap';

/**
 * Maps Envio InProcess_Moment_Admins_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Resolves collection address+chain_id+token_id to moment ID.
 * - Maps admin address to artist_address.
 * - Converts granted_at from chain timestamp to ISO timestamp.
 *
 * @param momentAdmins - Array of InProcess_Moment_Admins_t from Envio.
 * @returns Array of objects formatted for Supabase upsert.
 */
export async function mapMomentAdminsToSupabase(
  momentAdmins: InProcess_Moment_Admins_t[]
): Promise<
  Array<Database['public']['Tables']['in_process_moment_admins']['Insert']>
> {
  const triplets: Array<[string, number, number]> = momentAdmins.map(
    admin =>
      [admin.collection, admin.chain_id, admin.token_id] as [
        string,
        number,
        number,
      ]
  );
  const momentIdMap = await getMomentIdMap(triplets);

  const mappedAdmins = momentAdmins
    .map(admin => {
      const tripletKey = `${admin.collection.toLowerCase()}:${admin.chain_id}:${admin.token_id}`;
      const momentId = momentIdMap.get(tripletKey);
      if (!momentId) {
        return undefined;
      }
      return {
        moment: momentId,
        artist_address: admin.admin.toLowerCase(),
        granted_at: toSupabaseTimestamp(admin.granted_at)!,
        hidden: false,
      };
    })
    .filter(admin => admin !== undefined);

  return mappedAdmins;
}
