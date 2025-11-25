import { Database } from '../types';
import { upsertArtists } from './upsertArtists';

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
    }));

  try {
    await upsertArtists(artists);
  } catch (err) {
    console.error('❌ ensureArtists exception:', err);
  }
}
