import { supabase } from '../client.js';

/**
 * Upserts multiple token admin records into the in_process_token_admins table.
 * @param {Array<Object>} tokenAdmins - Array of token admin data objects to upsert.
 * Each object should have: { token: string, artist_address: string }
 * @returns {Promise<Object>} - The upserted records or error.
 */
export async function upsertTokenAdmins(tokenAdmins) {
  if (!tokenAdmins || tokenAdmins.length === 0) {
    return [];
  }

  // Remove duplicates based on conflict columns (token and artist_address)
  const uniqueTokenAdmins = tokenAdmins.filter(
    (tokenAdmin, index, self) =>
      index ===
      self.findIndex(
        ta =>
          ta.token === tokenAdmin.token &&
          ta.artist_address === tokenAdmin.artist_address
      )
  );

  // Log deduplication info if there were duplicates
  if (uniqueTokenAdmins.length < tokenAdmins.length) {
    console.log(
      `Deduplicated token admins: ${tokenAdmins.length} -> ${
        uniqueTokenAdmins.length
      } (removed ${tokenAdmins.length - uniqueTokenAdmins.length} duplicates)`
    );
  }

  const { data, error } = await supabase
    .from('in_process_token_admins')
    .upsert(uniqueTokenAdmins, {
      onConflict: 'token, artist_address',
    })
    .select();

  if (error) {
    throw error;
  }
  return data;
}
