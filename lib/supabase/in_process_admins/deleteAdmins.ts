import { supabase } from '@/lib/supabase/client';

interface DeleteAdminCriteria {
  collection: string;
  artist_address: string;
  token_id: number;
}

/**
 * Deletes admins from Supabase based on collection, artist_address, and token_id.
 * @param admins - Array of admin criteria objects to delete.
 * @returns Number of deleted rows.
 */
export async function deleteAdmins(
  admins: DeleteAdminCriteria[]
): Promise<number> {
  if (admins.length === 0) {
    console.log('ℹ️  No admins to delete');
    return 0;
  }

  try {
    // Build OR conditions for all admins to delete
    // Format: (collection.eq.X.and.artist_address.eq.Y.and.token_id.eq.Z).or(...)
    const orConditions = admins
      .map(
        admin =>
          `and(collection.eq.${admin.collection},artist_address.eq.${admin.artist_address},token_id.eq.${admin.token_id})`
      )
      .join(',');

    const { data, error } = await supabase
      .from('in_process_admins')
      .delete()
      .or(orConditions)
      .select();

    if (error) {
      throw error;
    }

    const deletedCount = data?.length || 0;
    console.log(`🗑️  Deleted ${deletedCount} admin(s)`);
    return deletedCount;
  } catch (error) {
    console.error(`❌ Failed to delete admins:`, error);
    throw error;
  }
}
