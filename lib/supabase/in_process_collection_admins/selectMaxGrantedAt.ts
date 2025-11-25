import { supabase } from '../client';

/**
 * Gets the maximum granted_at timestamp from in_process_collection_admins table.
 * Used for incremental indexing to only fetch records granted after this timestamp.
 * @returns Maximum granted_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxGrantedAt(): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('in_process_collection_admins')
      .select('granted_at')
      .order('granted_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // PGRST116 means no rows found, which is fine for initial sync
      if (error.code === 'PGRST116') {
        console.log(
          'ℹ️  No collection admins found in Supabase, starting from beginning'
        );
        return null;
      }
      throw error;
    }

    if (!data || !data.granted_at) {
      return null;
    }

    // Convert ISO timestamp to milliseconds
    const maxGrantedAt = new Date(data.granted_at).getTime();
    return maxGrantedAt;
  } catch (error) {
    console.error('❌ Error selecting max granted_at:', error);
    throw error;
  }
}
