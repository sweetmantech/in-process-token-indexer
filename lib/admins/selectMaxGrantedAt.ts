import { selectAdmins } from '@/lib/supabase/in_process_admins/selectAdmins';

/**
 * Gets the maximum granted_at timestamp from in_process_admins table.
 * Used for incremental indexing to only fetch records granted after this timestamp.
 * @returns Maximum granted_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxGrantedAt(): Promise<number | null> {
  try {
    const data = await selectAdmins({
      order: { column: 'granted_at', ascending: false },
      limit: 1,
    });

    if (!data || data.length === 0 || !data[0]?.granted_at) {
      return null;
    }

    // Convert ISO string to milliseconds timestamp
    return new Date(data[0].granted_at).getTime();
  } catch (error) {
    console.error('❌ Error selecting max granted_at:', error);
    throw error;
  }
}
