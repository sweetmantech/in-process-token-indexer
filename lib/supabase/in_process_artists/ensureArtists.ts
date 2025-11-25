import { Database } from '../types';
import { supabase } from '../client';

/**
 * Ensures artists exist in the 'in_process_artists' table based on provided addresses.
 * - Inserts any missing addresses as new artists (addresses are required, all other fields null).
 * - Ignores addresses already present.
 * - Small, idempotent, focused: for use in indexer pre-writes to satisfy FK constraints.
 * - All inserts are batched in a single upsert.
 *
 * @param addresses Array of artist (admin) addresses to ensure exist in Supabase.
 */
export async function ensureArtists(addresses: string[]): Promise<void> {
  if (!addresses.length) return;

  // Deduplicate, create minimal artist records
  const artists: Database['public']['Tables']['in_process_artists']['Insert'][] =
    [...new Set(addresses.map(addr => addr.toLowerCase()))].map(address => ({
      address,
      bio: null,
      farcaster_username: null,
      instagram_username: null,
      smart_wallet: null,
      telegram_username: null,
      twitter_username: null,
      username: null,
    }));

  try {
    const { error } = await supabase
      .from('in_process_artists')
      .upsert(artists, { onConflict: 'address' });

    if (error) {
      console.error(`❌ ensureArtists upsert error:`, error);
    } else {
      console.log(`✅ ensureArtists: Upserted ${artists.length} artists`);
    }
  } catch (err) {
    console.error('❌ ensureArtists exception:', err);
  }
}
