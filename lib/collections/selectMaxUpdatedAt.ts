import { selectCollections } from '@/lib/supabase/in_process_collections/selectCollections';

/**
 * Gets the maximum updated_at timestamp from in_process_collections table.
 * Used for incremental indexing to determine the starting point for fetching new records.
 * @returns Maximum updated_at timestamp in milliseconds (epoch), or null if no records exist.
 */
export async function selectMaxUpdatedAt(): Promise<number | null> {
  try {
    const data = await selectCollections({
      order: { column: 'updated_at', ascending: false },
      limit: 1,
    });

    if (!data || data.length === 0 || !data[0]?.updated_at) {
      return null;
    }

    // Convert ISO string to milliseconds timestamp
    return new Date(data[0].updated_at).getTime();
  } catch (error) {
    // If no records found, return null (not an error)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'PGRST116'
    ) {
      return null;
    }
    console.error(
      '❌ Failed to fetch max updated_at from in_process_collections:',
      error
    );
    return null;
  }
}
